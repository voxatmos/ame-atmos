import Handsontable from "handsontable/base";
import { registerPlugin, AutoColumnSize, ManualColumnMove, CopyPaste, DragToScroll } from "handsontable/plugins";
import infoIcon from "../assets/icons/info.svg?raw";
import { offAlbumRoute, onAlbumRoute } from "../glue/router";
import { createButtonElement, hideSidebarButton, showSidebarButton } from "../glue/sidebar";
import { getAlbum } from "../services/album";
import { getAccountStorefront, getStorefronts } from "../services/storefront";
import { fetchCors } from "../../common/fetch";
import { Album, Resource } from "../types";
import { ripLyrics } from "./lyrics";
import { fromHTML } from "../../common/dom";
import { downloadFile } from "../../common/misc";

registerPlugin(AutoColumnSize);
registerPlugin(ManualColumnMove);
registerPlugin(CopyPaste);
registerPlugin(DragToScroll);

interface Row {
	audioTraits: string;
	id: string;
	discNumber: number;
	trackNumber: number;
	duration: string;
	isrc: string;
	upc: string;
	albumDate: string;
	trackDate: string;
	locale: string;
	lyrics: string;
	genres: string;
	composer: string;
	artist: string;
	title: string;
	label: string;
	copyright: string;
	albumArtist: string;
	albumTitle: string;
}

const COLUMN_NAME: Partial<Record<keyof Row, string>> = {
	audioTraits: "Formats"
	id: "ID",
	discNumber: "Disc #",
	trackNumber: "Track #",
	duration: "Duration",
	isrc: "ISRC",
	upc: "UPC",
	albumDate: "Album Date",
	trackDate: "Track Date",
	locale: "Locale",
	lyrics: "Lyrics",
	genres: "Genres",
	composer: "Composer",
	artist: "Artist",
	title: "Title",
	label: "Label",
	copyright: "Copyright",
	albumArtist: "Album Artist",
	albumTitle: "Album Title"
};

const COLUMN_KEY: Partial<Record<string, keyof Row>> = Object.fromEntries(Object.entries(COLUMN_NAME).map(e => e.reverse()));

const COLUMN_ORDER: (keyof Row)[] = [
	"audioTraits"
	"id",
	"discNumber",
	"trackNumber",
	"duration",
	"isrc",
	"upc",
	"albumDate",
	"trackDate",
	"locale",
	"lyrics",
	"genres",
	"composer",
	"artist",
	"title",
	"label",
	"copyright",
	"albumArtist",
	"albumTitle"
];

export const showInfoButtonEl = createButtonElement("Show Info", infoIcon);
showInfoButtonEl.addEventListener("click", showDock);

let isVisible = false;
let dockEl: HTMLElement | null = null;

onAlbumRoute(async () => {
	showSidebarButton(showInfoButtonEl, 300);
	hideDock();
});

offAlbumRoute(() => {
	hideSidebarButton(showInfoButtonEl);
	hideDock();
});

async function showDock() {
	if (isVisible) return;
	isVisible = true;

	const albumId = location.pathname.split("/")[4];
	let activeAlbum: Resource<Album> | null = null;
	let activeStorefront = localStorage.getItem("ame-info-storefront") || location.pathname.split("/")[1];
	const storefronts = await getStorefronts();

	dockEl = fromHTML(`
		<div id="ame-dock">
			<div id="ame-dock-title">Album Info</div>
			<div id="ame-dock-control">
				<select id="ame-dock-control-storefront">
					${storefronts.map(storefront => `<option value="${storefront.id}"${storefront.id === activeStorefront ? " selected" : ""}>${storefront.attributes.name}</option>`).join("")}
				</select>
				<button id="ame-dock-control-isrc2mb" title="Seed ISRCs to MusicBrainz.">ISRC2MB</button>
				<button id="ame-dock-control-lyrics" title="Download a zip file with lyrics when available.">LYRICS (${getAccountStorefront()?.toUpperCase() || "N/A"})</button>
				<button id="ame-dock-control-raw" title="Download the raw album API response.">RAW</button>
			</div>
			<div id="ame-dock-table"></div>
		</div>
	`);

	const titleEl = dockEl.querySelector<HTMLElement>("#ame-dock-title")!;
	const storefrontEl = dockEl.querySelector<HTMLSelectElement>("#ame-dock-control-storefront")!;
	const isrc2mbActionEl = dockEl.querySelector<HTMLSelectElement>("#ame-dock-control-isrc2mb")!;
	const lyricsActionEl = dockEl.querySelector<HTMLSelectElement>("#ame-dock-control-lyrics")!;
	const rawActionEl = dockEl.querySelector<HTMLSelectElement>("#ame-dock-control-raw")!;
	const tableEl = dockEl.querySelector<HTMLElement>("#ame-dock-table")!;

	titleEl.addEventListener("click", () => {
		hideDock();
	});

	rawActionEl.addEventListener("click", async () => {
		const album = await getAlbum(albumId, activeStorefront);
		downloadFile(new Blob([ JSON.stringify(album, null, "\t") ], { type: "application/json" }), `${albumId}.json`);
	});

	isrc2mbActionEl.addEventListener("click", async () => {
		if (!activeAlbum) return;

		const upc = activeAlbum.attributes.upc.replace(/^0+/, "");
		const res = await fetchCors(`https://musicbrainz.org/ws/2/release/?fmt=json&query=barcode:${upc}%20AND%20format:digitalmedia`);
		const body = await res.json<{ releases: { id: string; }[] }>();

		const params = new URLSearchParams();
		if (body.releases.length) params.set("mbid", body.releases[0].id);
		activeAlbum.relationships.tracks.data.forEach((track, i) => { params.set(`isrc${i + 1}`, track.attributes.isrc); });

		open(`https://magicisrc.kepstin.ca/?${params.toString()}`, "_blank");
	});

	let isRippingLyrics = false;
	lyricsActionEl.addEventListener("click", async () => {
		if (isRippingLyrics) return;
		isRippingLyrics = true;

		try {
			await ripLyrics(albumId);
		} catch (err) {
			console.error(err);
		}

		isRippingLyrics = false;
	});

	let columns: (keyof Row)[] = JSON.parse(localStorage.getItem("ame-info-columns") || "[]");
	if (columns.length !== COLUMN_ORDER.length) columns = COLUMN_ORDER;

	document.body.appendChild(dockEl);

	const table = new Handsontable(tableEl, {
		licenseKey: "non-commercial-and-evaluation",
		data: [],
		rowHeaders: true,
		columns: columns.map(name => ({ data: name, title: COLUMN_NAME[name] })),
		editor: false,
		manualColumnMove: true,
		height: Math.max(320, Math.floor(innerHeight / 3)),
		stretchH: "all",
		wordWrap: false,
		renderer(instance, td, rowIndex, colIndex, prop, value, cellProperties) {
			const row = instance.getSourceDataAtRow(rowIndex) as Row;

			if (rowIndex % 2) td.classList.add("ame-table-band");

			switch (columns[colIndex]) {
				case "trackDate":
					if (row.albumDate !== row.trackDate) td.style.textDecoration = "underline";
					td.innerText = value;
					break;
				default:
					td.innerText = value;
					break;
			}
		},
		afterColumnMove(movedColumns, finalIndex, dropIndex, movePossible, orderChanged) {
			if (!orderChanged) return;
			const newColumns = Array.from({ length: table.countCols() }, (_, i) => COLUMN_KEY[table.getColHeader(i) as keyof Row]);
			localStorage.setItem("ame-info-columns", JSON.stringify(newColumns));
		}
	});

	const containerEl = document.querySelector<HTMLElement>(".app-container")!;
	containerEl.style.paddingBottom = dockEl!.clientHeight + "px";

	async function render() {
		const album = await getAlbum(albumId, activeStorefront);
		if (!album) return;
		activeAlbum = album;

		console.log("Album Info:", album);

		let title = 'Album Info';
		if (!album.attributes.isComplete) title += ` (Incomplete - ${album.relationships.tracks.data.length}/${album.attributes.trackCount})`;
		titleEl.innerText = title;
		isrc2mbActionEl.style.display = album.attributes.isComplete ? "" : "none";

		const tracks: Row[] = album.relationships.tracks.data
			.map(track => ({
				audioTraits: track.attributes.audioTraits.join("\\\\"),
				id: track.id,
				discNumber: track.attributes.discNumber,
				trackNumber: track.attributes.trackNumber,
				duration: formatDuration(track.attributes.durationInMillis),
				isrc: track.attributes.isrc ?? "",
				upc: album.attributes.upc ?? "",
				albumDate: album.attributes.releaseDate ?? "",
				trackDate: track.attributes.releaseDate ?? "",
				locale: track.attributes.audioLocale ?? "",
				lyrics: track.attributes.hasLyrics ? (track.attributes.hasTimeSyncedLyrics ? "S" : "U") : "",
				genres: track.attributes.genreNames.join("\\\\"),
				composer: track.attributes.composerName ?? "",
				artist: track.attributes.artistName,
				title: track.attributes.name,
				label: album.attributes.recordLabel ?? "",
				copyright: album.attributes.copyright ?? "",
				albumArtist: album.attributes.artistName,
				albumTitle: album.attributes.name
			}));

		table.updateData(tracks);
	}

	await render();
	storefrontEl.addEventListener("change", async e => {
		activeStorefront = (e.target as HTMLSelectElement).value;
		localStorage.setItem("ame-info-storefront", activeStorefront);
		await render();
	});
}

function hideDock() {
	isVisible = false;
	dockEl?.remove();
	dockEl = null;

	const containerEl = document.querySelector<HTMLElement>('.app-container')!;
	if (containerEl) containerEl.style.paddingBottom = "";
}

function formatDuration(ms: number): string {
	let seconds = Math.floor(ms / 1000);
	const minutes = Math.floor(seconds / 60);
	seconds = seconds % 60;
	return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
