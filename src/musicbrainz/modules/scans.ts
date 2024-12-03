import JSZip from "jszip";
import { fromHTML } from "../../common/dom";
import { downloadFile, sleep } from "../../common/misc";
import { onReleaseViewCoverRoute } from "../glue/router";
import { getPageReleaseInfo } from "../services/release";
import { formatPath } from "../../common/format";
import { fetchCors } from "../../common/fetch";

onReleaseViewCoverRoute(() => {
	const artworkEls = document.querySelectorAll<HTMLElement>(".artwork-cont");
	if (!artworkEls.length) return;

	const refEl = document.querySelector<HTMLElement>(".buttons.ui-helper-clearfix")!;
	const downloadButtonEl = fromHTML(`<a class="ame-download-scans"><bdi>Download all scans</bdi></a>`);
	refEl.appendChild(downloadButtonEl);

	let downloading = false;
	downloadButtonEl.addEventListener("click", async () => {
		if (downloading) return;
		downloading = true;

		try {
			await downloadScans(artworkEls, downloadButtonEl);
		} catch (err) {
			downloadButtonEl.innerHTML = `Download all scans (Retry)`;
			console.error(err);
		}

		downloading = false;
	});
});

async function downloadScans(artworkEls: NodeListOf<HTMLElement>, progressEl: HTMLElement) {
	const zip = new JSZip();

	const release = getPageReleaseInfo();
	if (!release) return;

	const types: Record<string, number> = {};

	let index = 0;

	progressEl.innerHTML = `Download all scans (0/${artworkEls.length})`;

	for (const artworkEl of artworkEls) {
		index++;

		const downloadEl = artworkEl.querySelector<HTMLLinkElement>("a:last-child");
		if (!downloadEl) continue;

		const type = artworkEl.querySelector("p")?.innerText.replace("Types:", "").trim();
		if (!type) continue;

		types[type] = Number(types[type]) + 1 || 1;
		const typeCount = types[type];

		for (let attempt = 0; attempt < 5; attempt++) {
			try {
				const filename = `${type} ${typeCount}.${downloadEl.href.split(".").at(-1)}`;
				const data = await fetchCors(downloadEl.href).then(res => res.blob());
				zip.file(formatPath(filename), data);

				progressEl.innerHTML = `Download all scans (${index}/${artworkEls.length})`;
				await sleep(100);
				break;
			} catch (err) {
				console.error(err);
			}
		}
	}

	progressEl.innerHTML = `Download all scans (Zipping 0%)`;

	const foldername = `Scans {${release.catalogs[0] || release.barcode || release.id}}`;
	const zipBlob = await zip.generateAsync({ type: "blob" }, (e) => {
		progressEl.innerHTML = `Download all scans (Zipping ${e.percent.toFixed(0)}%)`;
	});

	downloadFile(zipBlob, formatPath(`${foldername}.zip`));

	progressEl.innerHTML = `Download all scans (Done)`;
}
