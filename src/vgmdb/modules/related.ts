import { fetchCors } from "../../common/fetch";
import { addAlbumSidebarButton } from "../glue/sidebar";
import { onAlbumRoute } from "../glue/router";
import musicbrainzIcon from "../assets/icons/musicbrainz.ico";
import ongakuNoMoriIcon from "../assets/icons/ongakunomori.ico";
import mhCoversIcon from "../assets/icons/mhcovers.svg";
import { createMusicBrainzReleaseSeeder } from "./musicbrainz";
import { AlbumInfo, getPageAlbumInfo } from "../services/album";

onAlbumRoute(async () => {
	const album = getPageAlbumInfo();

	await Promise.all([
		addMusicBrainz(album),
		addOngakuNoMori(album),
		addMhCovers(album)
	]);
});

async function addMusicBrainz(album: AlbumInfo) {
	let query: string[] = [];
	if (album.catalog) for (const catalog of album.catalogs) query.push(`catno:${catalog}`);
	if (album.barcode) query.push(`barcode:${album.barcode}`);

	function addSeedLink() {
		function seed(e: MouseEvent) {
			e.preventDefault();
			createMusicBrainzReleaseSeeder(album).submit();
		}

		const linkEl = addAlbumSidebarButton(100, musicbrainzIcon, "MusicBrainz <small>(Seed)</small>", "#");
		linkEl.addEventListener("click", seed);
		linkEl.addEventListener("auxclick", seed);
	}

	if (query.length === 0) {
		addSeedLink();
		return;
	}

	const res = await fetchCors(`http://musicbrainz.org/ws/2/release/?fmt=json&query=${encodeURIComponent(query.join(" "))}`);
	const body = await res.json<{ releases: { id: string, barcode?: string }[] }>();

	if (body.releases.length === 0) {
		addSeedLink();
	} else if (body.releases.some(release => release.barcode === album.barcode)) {
		addAlbumSidebarButton(200, musicbrainzIcon, "MusicBrainz", `https://musicbrainz.org/release/${body.releases[0].id}`);
	} else {
		addSeedLink();
		addAlbumSidebarButton(200, musicbrainzIcon, "MusicBrainz <small>(Search)</small>", `https://musicbrainz.org/search?type=release&method=advanced&query=${encodeURIComponent(query.join(" "))}`);
	}
}

async function addOngakuNoMori(album: AlbumInfo) {
	const dn = album.catalogs[0] ?? album.barcode;
	if (!dn) return;

	addAlbumSidebarButton(300, ongakuNoMoriIcon, "音楽の森 <small>(Search)</small>", `https://search.minc.or.jp/product/list/?type=search-form-diskno&dn=${dn}`);
}

async function addMhCovers(album: AlbumInfo) {
	addAlbumSidebarButton(400, mhCoversIcon, "MH Covers <small>(Search)</small>", `https://covers.musichoarders.xyz?artist=${encodeURIComponent(album.artist)}&album=${encodeURIComponent(album.album)}`);
}
