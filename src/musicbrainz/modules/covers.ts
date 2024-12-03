import { fetchCors } from "../../common/fetch";
import { fromHTML } from "../../common/dom";
import { onReleaseAddCoverRoute } from "../glue/router";
import { ReleaseInfo, TocType, getPageReleaseInfo, getReleaseToc } from "../services/release";

enum QueryType {
	Search = "search",
	Barcode = "barcode",
	Catalog = "catalog",
	Toc = "toc"
}

interface CoverData {
	action: string;
	smallCoverUrl: string;
	bigCoverUrl: string;
	source: string;
	releaseInfo: {
		url?: string;
	}
}

onReleaseAddCoverRoute(() => {
	const refEl = document.querySelector(".fileinput-button.buttons");
	if (!refEl) return;

	const release = getPageReleaseInfo();
	if (!release) return;

	const buttonEl = fromHTML<HTMLSelectElement>(`
		<select>
			<option value="" disabled selected>Search MH Covers...</option>
			<option value="search">by Artist and Album</option>
			${release.barcode ? `<option value="barcode">by Barcode</option>` : ""}
			${release.catalogs.length ? `<option value="catalog">by Catalog</option>` : ""}
			${release.tocType === TocType.Exact || release.tocType === TocType.Deduced ? `<option value="toc">by TOC</option>` : ""}
		</select>
	`);

	buttonEl.addEventListener("input", async () => {
		const value = buttonEl.value as QueryType;
		buttonEl.value = "";
		await openPicker(release, value);
	});

	refEl.appendChild(buttonEl);
});

async function openPicker(releaseInfo: ReleaseInfo, queryType: QueryType) {
	const params = new URLSearchParams();
	params.set("remote.port", "browser");
	params.set("remote.agent", "Ame - MusicBrainz");
	params.set("remote.text", "Pick cover for MusicBrainz release.");
	switch (queryType) {
		case QueryType.Search:
			params.set("artist", releaseInfo.artist);
			params.set("album", releaseInfo.title);
			break;
		case QueryType.Barcode:
			if (!releaseInfo.barcode) return;
			params.set("barcode", releaseInfo.barcode);
			break;
		case QueryType.Catalog:
			if (!releaseInfo.catalogs.length) return;
			params.set("catalog", releaseInfo.catalogs[0]);
			break;
		case QueryType.Toc:
			const toc = await getReleaseToc(releaseInfo);
			if (!toc) return;
			params.set("toc", toc);
			break;
		default:
			return;
	}

	const win = open(`https://covers.musichoarders.xyz?${params}`, "_blank");
	if (!win) return;

	// Close covers window when the release page is closed.
	addEventListener("beforeunload", () => {
		win.close();
	});

	addEventListener("message", async e => {
		try {
			if (e.source !== win) return;
			const data = JSON.parse(e.data);
			switch (data.action) {
				case "primary":
				case "secondary":
					win?.close();
					await pickCover(data);
					break;
			}
		} catch (err) {}
	}, false);
}

async function pickCover(data: CoverData) {
	const res = await fetchCors(data.bigCoverUrl);
	const cover = await res.blob();

	// Drop image "file" into form.
	const dataTransfer = new DataTransfer();
	Object.defineProperty(dataTransfer, 'files', { value: [ cover ] });
	const event = new DragEvent('drop', { dataTransfer });
	document.querySelector('#drop-zone')?.dispatchEvent(event);

	// Get image detail section.
	const newDetailEl = document.querySelector('#add-cover-art tr:last-of-type');
	if (!newDetailEl) return;

	// Add front type.
	const frontTypeEl = newDetailEl.querySelector<HTMLInputElement>('input[type="checkbox"]');
	if (frontTypeEl) frontTypeEl.click();

	// Add edit note.
	const noteEl = document.body.querySelector<HTMLInputElement>('.edit-note');
	if (noteEl) {
		let note = `Seeded with Ame through https://covers.musichoarders.xyz`;
		if (data.releaseInfo.url) note += ` for ${data.releaseInfo.url}`;
		note += ` from ${data.bigCoverUrl}`;
		noteEl.value = note;
	}
}
