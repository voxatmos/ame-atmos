import { fromHTML } from "../../common/dom";
import { getPageReleaseId } from "../services/release";

enum QueryType {
	Unknown = "unknown",
	Barcode = "barcode",
	Catalog = "catalog",
	Isrc = "isrc",
	Iswc = "iswc",
	Toc = "toc"
}

interface TocEntry {
	startSector: number;
	endSector: number;
}

const formEl = document.querySelector<HTMLFormElement>("form[action='/search']") ?? document.createElement("form");
const queryEl = document.querySelector<HTMLInputElement>("#headerid-query") ?? document.createElement("input");
const typeEl = document.querySelector<HTMLSelectElement>("#headerid-type") ?? document.createElement("select");
const submitEl = document.querySelector<HTMLInputElement>("form[action='/search'] button") ?? document.createElement("input");

queryEl.focus();
queryEl.placeholder = "Enhanced search";

typeEl.options.add(fromHTML<HTMLOptionElement>(`<option value="barcode">Barcode</option>`));
typeEl.options.add(fromHTML<HTMLOptionElement>(`<option value="catalog">Catalog</option>`));
typeEl.options.add(fromHTML<HTMLOptionElement>(`<option value="toc">CD TOC</option>`));
typeEl.options.add(fromHTML<HTMLOptionElement>(`<option value="isrc">ISRC</option>`));
typeEl.options.add(fromHTML<HTMLOptionElement>(`<option value="iswc">ISWC</option>`));

queryEl.addEventListener("input", () => {
	const toc = parseTocFromLog(queryEl.value);
	if (toc) queryEl.value = toc;

	switch (identifyQuery(queryEl.value)) {
		case QueryType.Barcode:
			typeEl.value = "barcode";
			break;
		case QueryType.Catalog:
			typeEl.value = "catalog";
			break;
		case QueryType.Isrc:
			typeEl.value = "isrc";
			break;
		case QueryType.Iswc:
			typeEl.value = "iswc";
			break;
		case QueryType.Toc:
			typeEl.value = "toc";
			break;
	}
});

formEl.addEventListener("dragover", e => {
	e.preventDefault();
	const transfer = e.dataTransfer;
	if (!transfer) return;
	transfer.dropEffect = "link";
});

formEl.addEventListener("drop", async e => {
	e.preventDefault();
	const transfer = e.dataTransfer;
	if (!transfer) return;
	const file = transfer.files.item(0);
	if (!file?.name.match(/\.log$/)) return;
	const reader = new FileReader();
	reader.readAsText(file);
	reader.onload = () => {
		queryEl.value = reader.result as string;
		queryEl.dispatchEvent(new Event("input"));
		submitEl.click();
	};
});

formEl.addEventListener("submit", e => {
	const data = new FormData(formEl);
	const query = (data.get("query") as string).trim();
	const queryType = identifyQuery(query);
	if (queryType === QueryType.Unknown) return;
	e.preventDefault();

	switch (queryType) {
		case QueryType.Barcode:
			location.href = `https://musicbrainz.org/search?type=release&method=advanced&query=barcode:${encodeURIComponent(query)}`;
			break;
		case QueryType.Catalog:
			location.href = `https://musicbrainz.org/search?type=release&method=advanced&query=catno:${encodeURIComponent(formatCatalog(query))}`;
			break;
		case QueryType.Isrc:
			location.href = `https://musicbrainz.org/search?type=recording&method=advanced&query=isrc:${encodeURIComponent(query)}`;
			break;
		case QueryType.Iswc:
			location.href = `https://musicbrainz.org/search?type=work&method=advanced&query=iswc:${encodeURIComponent(query)}`;
			break;
		case QueryType.Toc:
			let params = `?toc=${query}`;
			if (location.pathname.startsWith("/release/")) params += `&filter-release.query=${getPageReleaseId()}`;
			location.href = `https://musicbrainz.org/cdtoc/attach${params}`;
			break;
	}
});

export function identifyQuery(value: string): QueryType {
	if (/^(\d{8}|\d{12}|\d{13}|\d{14})$/.test(value)) return QueryType.Barcode;
	if (/^[a-zA-Z]{5}[0-9]{7}$/.test(value)) return QueryType.Isrc;
	if (/^T-\d{3}.\d{3}.\d{3}-\d$/.test(value)) return QueryType.Iswc;
	if (value === value.toUpperCase() && /\d/.test(value) && /[a-zA-Z]/.test(value) && /[ ~-]/.test(value)) return QueryType.Catalog;
	if (value.split(" ").filter(Number).length >= 4) return QueryType.Toc;
	return QueryType.Unknown;
}

function formatCatalog(value: string): string {
	return /^(.+)([1-9][0-9]*)~([0-9]+)$/.test(value) ? value.split('~')[0] : value;
}

function parseTocFromLog(text: string): string | null {
	const logs: TocEntry[][] = [ [] ];

	if (text.includes('Exact Audio Copy') || text.includes('X Lossless Decoder')) {
		let lastSector = 0;

		for (const match of text.matchAll(/ *\d+:\d+.\d+ *\| *\d+:\d+.\d+ *\| *(\d+) *\| *(\d+)/g)) {
			const entry: TocEntry = {
				startSector: Number(match[1]),
				endSector: Number(match[2])
			};

			if (entry.startSector < lastSector) logs.push([]);
			lastSector = entry.startSector;

			logs[logs.length - 1].push(entry);
		}
	} else if (text.includes('Log created by: whipper')) {
		for (const match of text.matchAll(/ Start sector: (\d+)\r?\n +End sector: (\d+)/g)) {
			logs[logs.length - 1].push({
				startSector: Number(match[1]),
				endSector: Number(match[2])
			});
		}
	}

	const entries = logs[logs.length - 1];
	if (!entries.length) return null;

	if (entries.length >= 2) {
		for (let i = 1; i < entries.length; i++) {
			const diff = entries[i].startSector - entries[i - 1].endSector;
			if (diff !== 11400 && diff !== 11401) continue;
			entries.splice(i, 1);
		}
	}

	const offsets = entries
		.map(entry => entry.startSector)
		.concat([ entries[entries.length - 1].endSector + 1 ]);

	return [ 1, offsets.length - 1, offsets[offsets.length - 1] + 150 ]
		.concat(offsets.slice(0, -1).map(entry => entry + 150))
		.join(" ");
}
