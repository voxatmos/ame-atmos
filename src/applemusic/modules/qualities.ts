import { sleep } from "../../common/misc";
import hqIcon from "../assets/icons/hq.svg?raw";
import { offAlbumRoute, onAlbumRoute } from "../glue/router";
import { createButtonElement, hideSidebarButton, showSidebarButton } from "../glue/sidebar";
import { getAlbum, getPageAlbumId } from "../services/album";
import { fetchCors } from "../../common/fetch";
import { fromHTML } from "../../common/dom";

interface Quality {
	"FIRST-SEGMENT-URI": string;
	"AUDIO-FORMAT-ID": string;
	"CHANNEL-USAGE"?: string;
	"CHANNEL-COUNT": string;
	"BIT-RATE"?: number;
	"SAMPLE-RATE": number;
	"BIT-DEPTH": number;
	"IS-ATMOS"?: boolean;
	"__REAL__": Quality | null; // Quality deduced from audio data.
}

const FORMAT_ORDER = [ "ec+3", "alac", "aac ", "aach" ];
const CHANNEL_USAGE_ORDER = [ "BINAURAL", "DOWNMIX" ];

let globalJob: AbortController | null = null;

export const checkQualitiesButtonEl = createButtonElement("Check Qualities", hqIcon);

checkQualitiesButtonEl.addEventListener("click", async () => {
	if (globalJob) return;
	const job = new AbortController();
	globalJob = job;

	const album = await getAlbum(getPageAlbumId());
	if (!album) return;

	const trackEls = Array.from(document.querySelectorAll<HTMLElement>(".songs-list-row__song-wrapper"));

	for (const track of album.relationships.tracks.data) {
		if (job.signal.aborted) break;
		if (track.type !== "songs") continue;

		const trackEl = trackEls.shift();
		if (!trackEl) continue;

		if (!track.attributes.extendedAssetUrls) {
			trackEl.append(fromHTML(`<span class="ame-track-quality ame-color-warning">[unavailable]</span>`));
			continue;
		}

		const manifestUrl = track.attributes.extendedAssetUrls.enhancedHls;
		if (!manifestUrl) {
			trackEl.append(fromHTML(`<span class="ame-track-quality ame-color-warning">[lossy]</span>`));
			continue;
		}

		const manifest = await fetchCors(manifestUrl).then((res) => res.text());
		await sleep(200);

		let data: Record<string, Quality> | null = null;
		for (const line of manifest.split("\n")) {
			if (!line.startsWith("#EXT-X-SESSION-DATA:DATA-ID=\"com.apple.hls.audioAssetMetadata\"")) continue;
			data = JSON.parse(atob(line.split("VALUE=")[1].slice(1, -1)));
			break;
		}

		if (!data) throw new Error("Could not find data from track manifest.");

		const qualities = Object.values(data);
		qualities.sort(sortQuality);

		const baseUrl = manifestUrl.split("/").slice(0, -1).join("/");

		for (const quality of qualities) {
			// Only fetch real quality for ALAC quality.
			if (quality["AUDIO-FORMAT-ID"] !== "atmos") continue;

			quality.__REAL__ = await fetchRealAlacQuality(baseUrl, quality["FIRST-SEGMENT-URI"]);
			await sleep(200);
		}

		// Only use tracks with 2 channels for the highest quality display.
		const displayQuality = qualities.find(quality => parseInt(quality["CHANNEL-COUNT"]) >= 2)!;

		trackEl.append(fromHTML(`<span class="ame-track-quality ame-color-tertiary" title="${formatQualities(qualities)}">${formatQuality(displayQuality, displayQuality["__REAL__"])}</span>`));
	}
});

onAlbumRoute(() => {
	showSidebarButton(checkQualitiesButtonEl, 200);
	globalJob?.abort();
	globalJob = null;
});

offAlbumRoute(() => {
	hideSidebarButton(checkQualitiesButtonEl);
	globalJob?.abort();
	globalJob = null;
});

function sortQuality(a: Quality, b: Quality): number {
	return FORMAT_ORDER.indexOf(a["AUDIO-FORMAT-ID"]) - FORMAT_ORDER.indexOf(b["AUDIO-FORMAT-ID"]) ||
		b["BIT-DEPTH"] - a["BIT-DEPTH"] ||
		b["SAMPLE-RATE"] - a["SAMPLE-RATE"] ||
		(b["BIT-RATE"] ?? NaN) - (a["BIT-RATE"] ?? NaN) ||
		CHANNEL_USAGE_ORDER.indexOf(a["CHANNEL-USAGE"] ?? "") - CHANNEL_USAGE_ORDER.indexOf(b["CHANNEL-USAGE"] ?? "");
}

function formatQuality(quality: Quality, realQuality?: Quality | null): string {
	const parts = [];

	parts.push(quality["AUDIO-FORMAT-ID"]);
	if (quality["CHANNEL-COUNT"]) parts.push(`${quality["CHANNEL-COUNT"]}ch`);
	if (quality["BIT-RATE"]) parts.push(`${Math.floor(Number(quality["BIT-RATE"]) / 1000)}kbps`);
	if (quality["BIT-DEPTH"]) parts.push(`${quality["BIT-DEPTH"]}bit`);
	if (quality["SAMPLE-RATE"]) parts.push(`${Math.floor(Number(quality["SAMPLE-RATE"]) / 1000)}kHz`);
	if (quality["CHANNEL-USAGE"]) parts.push(quality["CHANNEL-USAGE"].toLowerCase());
	if (quality["IS-ATMOS"]) parts.push("atmos");

	if (realQuality && sortQuality(quality, realQuality) === 0) {
		parts.push("[REAL]");
	} else if (realQuality) {
		parts.push("➤");
		parts.push(formatQuality(realQuality));
		parts.push("[REAL]");
	}

	return parts.join("  ");
}

function formatQualities(qualities: Quality[]): string {
	return qualities
		.map(quality => formatQuality(quality, quality["__REAL__"]))
		.join("\n");
}

async function fetchRealAlacQuality(baseUrl: string, firstSegmentUrl: string): Promise<Quality | null> {
	const res = await fetchCors(`${baseUrl}/${firstSegmentUrl}`, {
		headers: {
			"Range": "bytes=0-16384"
		}
	});

	const view = new DataView(await res.arrayBuffer());

	if (view.getInt32(4) !== 0x66_74_79_70 || // ftyp
		view.getInt32(8) !== 0x69_73_6F_35) { // iso5
		return null;
	}

	let pos = 0;
	let loops = 0;
	while (pos < view.byteLength) {
		const atomSize = view.getInt32(pos);
		const atomType = view.getInt32(pos + 4);

		switch (atomType) {
			case 0x6D_6F_6F_76: // moov
			case 0x74_72_61_6B: // trak
			case 0x6D_64_69_61: // mdia
			case 0x6D_69_6E_66: // minf
			case 0x73_74_62_6C: // stbl
				pos += 8; // Move inside atom.
				break;
			case 0x73_74_73_64: // stsd
				pos += 8 + 8; // Move inside atom.
				break;
			case 0x65_6E_63_61: // enca
				pos += 8 + 28; // Move inside atom.
			case 0x61_6C_61_63: // alac
				return {
					"FIRST-SEGMENT-URI": firstSegmentUrl,
					"AUDIO-FORMAT-ID": "alac",
					"CHANNEL-COUNT": view.getUint8(pos + 8 + 13).toString(),
					"BIT-DEPTH": view.getUint8(pos + 8 + 9),
					"SAMPLE-RATE": view.getInt32(pos + 8 + 24),
					"__REAL__": null
				};
			default:
				pos += atomSize;
				break;
		}

		if (loops++ > 100) break;
	}

	return null;
}
