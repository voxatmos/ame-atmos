import { parseDuration } from "../../common/format";
import { Release } from "../types";

export enum TocType {
	Incompatible = "incompatible",
	Deduced = "deduced",
	Exact = "exact"
}

export interface ReleaseInfo {
	id: string;
	title: string;
	artist: string;
	barcode?: string;
	catalogs: string[];
	tocType: TocType;
	trackCounts: number[];
}

function isFormatTocCompatible(format: string): boolean {
	format = format.toLowerCase().replace(/[^a-z+]/g, "");
	return format.includes("digitalmedia") || format.includes("cd") || format.includes("disc");
}

export function getPageReleaseId(): string {
	return location.pathname.split("/")[2];
}

export function getPageReleaseInfo(): ReleaseInfo | null {
	const releaseId = getPageReleaseId();

	let barcode = document.querySelector<HTMLElement>(".barcode")?.innerText;
	if (barcode === "[none]") barcode = undefined;

	const format = document.querySelector<HTMLElement>("dd.format")!.innerText;
	const tocEl = document.querySelector(".tabs a[href$='/discids']");
	const hasExactToc = tocEl && tocEl.textContent !== "Disc IDs (0)";

	return {
		id: releaseId,
		title: document.querySelector<HTMLElement>("h1 a")!.innerText,
		artist: document.querySelector<HTMLElement>(".subheader bdi")!.innerText,
		barcode,
		catalogs: Array.from(document.querySelectorAll<HTMLElement>(".catalog-number"))
			.map(el => el.innerText)
			.filter(catalog => catalog != "[none]"),
		tocType: hasExactToc ? TocType.Exact : isFormatTocCompatible(format) ? TocType.Deduced : TocType.Incompatible,
		trackCounts: Array.from(document.querySelectorAll("table.medium"))
			.map(mediumEl => mediumEl.querySelectorAll("td.pos").length)
	};
}

export async function getReleaseToc(releaseInfo: ReleaseInfo): Promise<string | null> {
	if (releaseInfo.tocType === TocType.Incompatible) return null;
	if (releaseInfo.tocType === TocType.Deduced) {
		const toc = getPageReleaseToc();
		if (toc) return toc;
	}

	try {
		const release = await fetch(`https://musicbrainz.org/ws/2/release/${releaseInfo.id}?fmt=json&inc=recordings+discids`)
			.then((res) => res.json<Release>());

		const exactDisc = release.media
			.flatMap(media => media.discs)
			.filter(disc => disc.offsets.length)[0];

		if (exactDisc) return [ 1, exactDisc.offsets.length, exactDisc.sectors ].concat(exactDisc.offsets).join(" ");

		const deducedDisc = release.media
			.filter(media => isFormatTocCompatible(media.format))[0];

		if (deducedDisc) {
			let toc = "0";
			let offset = 0;

			for (const track of deducedDisc.tracks) {
				offset += track.length / 1000 * 75;
				toc += `:${offset}`;
			}

			return toc;
		}
	} catch (err) {
		console.error(err);
	}

	return getPageReleaseToc();
}

function getPageReleaseToc(): string | null {
	const tocs: string[] = [];
	let offset = 0;

	for (const mediumEl of document.querySelectorAll("table.medium")) {
		tocs.push("0");

		for (const durationEl of mediumEl.querySelectorAll("td.treleases")) {
			offset += parseDuration(durationEl.innerHTML) * 75;
			tocs[tocs.length - 1] += `:${offset}`;
		}
	}

	return tocs.length ? tocs[0] : null;
}
