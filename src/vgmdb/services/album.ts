export interface AlbumInfo {
	id: string;
	artist: string;
	album: string;
	label?: string;
	publish?: string;
	classification?: string;
	currency?: string;
	date?: number[];
	catalog?: string;
	catalogs: string[];
	barcode?: string;
	mediums: (string | null)[];
	urls: string[];
	tracks: {
		number: number;
		title: string;
		duration: number;
	}[];
}

export function getPageAlbumInfo(): AlbumInfo {
	const artistTitle = (
		document.querySelector<HTMLElement>(".albumtitle[lang='ja']") ??
		document.querySelector<HTMLElement>(".albumtitle[lang='en']") ??
		document.querySelector<HTMLElement>(".albumtitle[lang='ja-Latn']")
	)!.innerText.replace(/^ \/ /, "");

	const [ title, artist ] = artistTitle.includes(" / ")
		? artistTitle.split(" / ", 2)
		: [ artistTitle, "" ];

	const info: AlbumInfo = {
		id: location.pathname.split("/")[2],
		artist,
		album: title,
		catalogs: [],
		mediums: [],
		urls: [],
		tracks: []
	};

	const rowEls = Array.from(document.querySelectorAll("#album_infobit_large tr"));
	for (const rowEl of rowEls) {
		const keyEl = rowEl.querySelector<HTMLElement>("td:first-child");
		const valueEl = rowEl.querySelector<HTMLElement>("td:last-child a") ?? rowEl.querySelector<HTMLElement>("td:last-child");
		if (!keyEl || !valueEl) continue;

		const key = keyEl.innerText.trim();
		const value = valueEl.innerText.trim();
		switch (key) {
			case "Label":
				info.label = value;
				break;
			case "Publish Format":
				info.publish = formatSlug(value);
				break;
			case "Classification":
				info.classification = formatSlug(value);
				break;
			case "Media Format":
				info.mediums = parseMediums(value);
			case "Release Price":
				if (value.includes("USD")) info.currency = "usd";
				else if (value.includes("JPY")) info.currency = "jpy";
				else if (value.includes("Japan")) info.currency = "jpy";
				else if (value.includes("KRW")) info.currency = "krw";
				else if (value.includes("RMB") || value.includes("CNY")) info.currency = "cny";
				break;
			case "Release Date":
				info.date = parseDate(valueEl.innerText);
				break;
			case "Catalog Number":
				if (value !== "N/A") {
					info.catalog = value;
					info.catalogs = splitCatalog(value);
				}
				break;
			case "Barcode":
				if (value !== "N/A") info.barcode = value;
				break;
		}
	}

	const tracklistIds: Record<string, string> = {};
	for (const navEl of Array.from(document.body.querySelectorAll<HTMLElement>("#tlnav a"))) {
		tracklistIds[navEl.innerText.trim().toLowerCase()] = navEl.getAttribute("rel")!;
	}

	let tracklistId = tracklistIds["japanese"] ?? tracklistIds["korean"] ?? tracklistIds["english"] ?? tracklistIds["chinese"] ?? tracklistIds["romaji"];
	if (info.currency === "jpy") tracklistId = tracklistIds["japanese"] ?? tracklistIds["english"] ?? tracklistIds["romaji"];
	else if (info.currency === "krw") tracklistId = tracklistIds["korean"] ?? tracklistIds["english"];
	else if (info.currency === "cny") tracklistId = tracklistIds["chinese"] ?? tracklistIds["english"];

	const tracklistEl = document.getElementById(tracklistId);
	if (tracklistEl) {
		for (const trackEl of Array.from(tracklistEl.querySelectorAll("tr.rolebit"))) {
			info.tracks.push({
				number: Number(trackEl.children[0].textContent),
				title: trackEl.children[1].textContent!.trim(),
				duration: parseDuration(trackEl.children[2].textContent!.trim())
			});
		}
	}

	const urlEls = Array.from(document.querySelectorAll(".smallfont a[href^='/redirect/']"));
	for (const urlEl of urlEls) {
		const url = "https://" + urlEl.getAttribute("href")!.split("/").slice(3).join("/");
		info.urls.push(url);
	}

	return info;
}

function formatSlug(value: string): string
function formatSlug(value: string | null): string | null {
	return value?.toLowerCase().replace(/[^a-z]/g, "") ?? null;
}

function splitCatalog(value: string): string[] {
	const match = value.match(/^(.+?)([1-9][0-9]*)~([0-9]+)$/);
	if (!match) return [ value ];
	const start = Number(match[2]);
	const end = Number(match[2].slice(0, -match[3].length) + match[3]);
	if (start === end) return [ value ];
	return Array.from({ length: end - start + 1 }, (_, i) => `${match[1]}${start + i}`);
}

function parseMediums(value: string): (string | null)[] {
	const mediums: (string | null)[] = [];
	const entries = value.toLowerCase().split(" + ");

	for (const entry of entries) {
		const match = entry.trim().match(/^(\d+)? *(.+)$/);
		if (!match) {
			mediums.push("unknown");
			continue;
		}

		const mediumCount = Number(match[1]) || 1;
		let mediumName: string | null = match[2].replace(/[^0-9a-z"]/g, "");

		if (mediumName.includes("cassette")) {
			mediumName = "cassette";
		} else if (mediumName.includes("minidisc")) {
			mediumName = "minidisc";
		} else if (mediumName.includes("minicd")) {
			mediumName = "8cm cd";
		} else if (mediumName.includes("shmcd")) {
			mediumName = "shm-cd";
		} else if (mediumName.includes("cdr")) {
			mediumName = "cd-r";
		} else if (mediumName.includes("hqcd")) {
			mediumName = "hqcd";
		} else if (mediumName.includes("cd")) {
			mediumName = "cd";
		} else if (mediumName.includes("dvd")) {
			mediumName = "dvd";
		} else if (mediumName.includes("vhs")) {
			mediumName = "vhs";
		} else if (mediumName.includes("vinyl")) {
			if (mediumName.includes("7\"")) mediumName = "7\" vinyl";
			else if (mediumName.includes("10\"")) mediumName = "10\" vinyl";
			else if (mediumName.includes("12\"")) mediumName = "12\" vinyl";
		} else if (mediumName.includes("bluray")) {
			mediumName = "bd";
		} else if (mediumName.includes("digital")) {
			mediumName = "digital media";
		} else if (mediumName.includes("sacd")) {
			mediumName = "sacd";
		} else if (mediumName.includes("usb")) {
			mediumName = "usb flash drive";
		} else {
			mediumName = null;
		}

		for (let i = 0; i < mediumCount; i++) mediums.push(mediumName);
	}

	return mediums;
}

function parseDate(value: string): number[] {
	const MONTHS: Record<string, number> = {
		Jan: 1,
		Feb: 2,
		Mar: 3,
		Apr: 4,
		May: 5,
		Jun: 6,
		Jul: 7,
		Aug: 8,
		Sep: 9,
		Oct: 10,
		Nov: 11,
		Dec: 12
	};

	const date: number[] = [];
	const parts = value.split(/,? /);

	switch (parts.length) {
		case 3:
			date.push(Number(parts[2]));
			date.push(MONTHS[parts[0]]);
			date.push(Number(parts[1]));
			break;
		case 2:
			date.push(Number(parts[1]));
			date.push(MONTHS[parts[0]]);
			break;
		case 1:
			date.push(Number(parts[0]));
			break;
	}

	return date;
}

function parseDuration(value: string): number {
	const [ hours, minutes ] = value.split(":").map(Number);
	return (hours * 60 + minutes) * 1000;
}
