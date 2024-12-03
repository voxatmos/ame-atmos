import { AlbumInfo } from "../services/album";
import { fromHTML } from "../../common/dom";

export function createMusicBrainzReleaseSeeder(album: AlbumInfo): HTMLFormElement {
	const formEl = fromHTML<HTMLFormElement>(`
		<form method="POST" target="_blank" action="https://musicbrainz.org/release/add" style="display: none;">
			<button type="submit">
				MusicBrainz <small>(Seed)</small>
			</button>
		</form>
	`);

	function set(key: string, value: string) {
		const inputEl = document.createElement("input");
		inputEl.type = "hidden";
		inputEl.name = key;
		inputEl.value = value;
		formEl.appendChild(inputEl);
	}

	const url = `${location.origin}${location.pathname}`;

	set("name", album.album);
	if (album.artist) {
		set("artist_credit.names.0.name", album.artist);
	}
	if (album.album.match(/[ㄱ-ㅎ가-힣]/)) {
		set("language", "kor");
		set("script", "Kore");
	} else if (album.album.match(/[一-龯]/)) {
		set("language", "jpn");
		set("script", "Jpan");
	} else {
		set("language", "eng");
		set("script", "Latn");
	}
	if (album.publish) {
		if (album.publish.includes("promo")) set("status", "promotion");
		else if (album.publish.includes("bootleg")) set("status", "bootleg");
		else set("status", "official");
	}
	if (album.tracks.length <= 6) {
		set("type", "single");
	} else {
		set("type", "album");
	}
	if (!album.classification) {
	} else if (album.classification.includes("soundtrack")) {
		set("type", "soundtrack");
	} else if (album.classification.includes("drama")) {
		set("type", "audio drama");
	} else if (album.classification.includes("remix")) {
		set("type", "remix");
	} else if (album.classification.includes("talk")) {
		set("type", "spokenword");
	}
	if (album.date) {
		switch (album.date.length) {
			case 3:
				set("events.0.date.day", album.date[2].toString());
			case 2:
				set("events.0.date.month", album.date[1].toString());
			case 1:
				set("events.0.date.year", album.date[0].toString());
		}
	}
	switch (album.currency) {
		case "jpy":
			set("events.0.country", "JP");
			break;
		case "krw":
			set("events.0.country", "KR");
			break;
		case "cny":
			set("events.0.country", "CN");
			break;
	}
	if (album.barcode) set("barcode", album.barcode);
	if (album.catalog) {
		album.catalogs.forEach((catalog, i) => {
			set(`labels.${i}.catalog_number`, catalog);
			if (album.label && i !== 0) set(`labels.${i}.name`, album.label);
		});
	}
	if (album.label) set("labels.0.name", album.label);

	album.mediums.forEach((medium, i) => {
		if (medium) set(`mediums.${i}.format`, medium);
	});

	let mediumNumber = 0;
	let trackNumber = 0;

	for (const track of album.tracks) {
		if (track.number <= trackNumber) mediumNumber++;
		trackNumber = track.number;

		set(`mediums.${mediumNumber}.track.${trackNumber - 1}.name`, track.title);
		set(`mediums.${mediumNumber}.track.${trackNumber - 1}.number`, track.number.toString());
		set(`mediums.${mediumNumber}.track.${trackNumber - 1}.length`, track.duration.toString());
	}

	set("urls.0.url", url);
	set("urls.0.link_type", "86"); // vgmdb
	album.urls.forEach((url, i) => {
		let type: string | null = null;
		if (url.includes("cdjapan.co.jp/") || url.includes("yesasia.com/") || url.includes("play-asia.com/")) {
			type = "79"; // purchase for mail-order
		} else if (url.includes("mora.jp/") || url.includes("ototoy.jp/")) {
			type = "74"; // purchase for download
		} else if (url.includes("y.qq.com/") || url.includes("open.qobuz.com/") || url.includes("tidal.com/") || url.includes("music.amazon.") || url.includes("music.apple.com/")) {
			type = "980"; // streaming page
		} else if (url.includes("deezer.com/") || url.includes(".spotify.")) {
			type = "85"; // stream for free
		} else if (url.includes("amazon.co.jp/")) {
			type = "77"; // asin
		}

		if (!type) return;

		set(`urls.${i + 1}.url`, url);
		set(`urls.${i + 1}.link_type`, type);
	});

	set("edit_note", `Seeded with Ame from VGMdb at ${url}`);

	document.body.appendChild(formEl);
	return formEl;
}
