import { onReleaseRoute } from "../glue/router";
import { ReleaseInfo, TocType, getPageReleaseInfo, getReleaseToc } from "../services/release";
import { addReleaseSidebarButton } from "../glue/sidebar";
import mhCoversIcon from "../assets/icons/mhcovers.svg";
import ongakuNoMoriIcon from "../assets/icons/ongakunomori.ico";

onReleaseRoute(async () => {
	const releaseInfo = getPageReleaseInfo();
	if (!releaseInfo) return;

	await Promise.all([
		addOngakuNoMoriToRelease(releaseInfo),
		addMhCoversToRelease(releaseInfo)
	]);
});

function addOngakuNoMoriToRelease(releaseInfo: ReleaseInfo) {
	const dn = releaseInfo.barcode ?? releaseInfo.catalogs[0];
	if (!dn) return;

	addReleaseSidebarButton(200, ongakuNoMoriIcon, "音楽の森 <small>(Search)</small>", `https://search.minc.or.jp/product/list/?type=search-form-diskno&dn=${dn}`);
}

async function addMhCoversToRelease(releaseInfo: ReleaseInfo) {
	addReleaseSidebarButton(300, mhCoversIcon, "MH Covers <small>(Search)</small>", `https://covers.musichoarders.xyz?artist=${encodeURIComponent(releaseInfo.artist)}&album=${encodeURIComponent(releaseInfo.title)}`);
	if (releaseInfo.tocType === TocType.Exact || releaseInfo.tocType === TocType.Deduced) {
		const toc = await getReleaseToc(releaseInfo);
		if (toc) addReleaseSidebarButton(400, mhCoversIcon, "MH Covers <small>(Search by TOC)</small>", `https://covers.musichoarders.xyz?toc=${encodeURIComponent(toc)}`);
	}
	if (releaseInfo.barcode) addReleaseSidebarButton(500, mhCoversIcon, "MH Covers <small>(Search by Barcode)</small>", `https://covers.musichoarders.xyz?barcode=${encodeURIComponent(releaseInfo.barcode)}`);
	if (releaseInfo.catalogs.length) addReleaseSidebarButton(600, mhCoversIcon, "MH Covers <small>(Search by Catalog)</small>", `https://covers.musichoarders.xyz?catalog=${encodeURIComponent(releaseInfo.catalogs[0])}`);
}
