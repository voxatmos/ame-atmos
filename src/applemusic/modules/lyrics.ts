import JSZip from "jszip";
import { downloadFile, sleep } from "../../common/misc";
import { getAlbum } from "../services/album";
import { getLyrics } from "../services/lyrics";
import { Lyrics, Track } from "../types";
import { formatPath } from "../../common/format";
import { getAccountStorefront } from "../services/storefront";

export async function ripLyrics(albumId: string) {
	const accountStorefront = getAccountStorefront();
	if (!accountStorefront) {
		alert("Lyrics can only be ripped when you have an active subscription in the specific storefront.");
		return;
	}

	const album = await getAlbum(albumId, accountStorefront);
	if (!album) return;

	const zip = new JSZip();

	for (const track of album.relationships.tracks.data) {
		if (track.attributes.hasTimeSyncedLyrics) {
			const syllableLyrics = await getLyrics(track.id, true, accountStorefront);
			if (syllableLyrics) zipLyrics(zip, track.attributes, syllableLyrics.attributes, true);
		}

		if (track.attributes.hasLyrics) {
			const lyrics = await getLyrics(track.id, false, accountStorefront);
			if (lyrics) zipLyrics(zip, track.attributes, lyrics.attributes, false);
		}

		await sleep(100);
	}

	if (Object.keys(zip.files).length === 0) {
		alert("No lyrics found.");
		return;
	}

	const lyricsZip = await zip.generateAsync({ type: "blob" });
	downloadFile(lyricsZip, formatPath(`Lyrics {${album.attributes.upc || album.id}}.zip`));
}

function zipLyrics(zip: JSZip, track: Track, lyrics: Lyrics, syllable: boolean) {
	const filename = formatPath(
		`${track.discNumber}-${track.trackNumber.toString().padStart(2, "0")}. ${track.name.slice(0, 120)}`
	);

	// Save raw lyrics.
	if (syllable && lyrics.ttml.includes("<span begin=")) {
		zip.file(`${filename}.syllable.ttml`, lyrics.ttml);
	} else {
		zip.file(`${filename}.ttml`, lyrics.ttml);
	}

	// Save converted lyrics.
	if (!syllable) {
		const lyricsDoc = new DOMParser().parseFromString(lyrics.ttml, "text/xml");
		let out = "";

		for (const lineNode of Array.from(lyricsDoc.querySelectorAll("p")) as HTMLParagraphElement[]) {
			const timestamp = lineNode.getAttribute("begin");
			if (timestamp) {
				out += `[${formatTimestamp(timestamp)}] ${lineNode.textContent}\n`;
			} else {
				out += `${lineNode.textContent}\n`;
			}
		}

		zip.file(`${filename}.lrc`, out);
	}
}

function formatTimestamp(timestamp: string): string {
	const parts = timestamp.split(/[:.]/g).reverse();
	const mm = (parts[2] ?? "").padStart(2, "0");
	const ss = (parts[1] ?? "").padStart(2, "0");
	const xx = Math.floor(Number(parts[0]) / 10).toString().padStart(2, "0");
	return `${mm}:${ss}.${xx}`;
}
