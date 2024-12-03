import JSZip from "jszip";
import { onAlbumRoute } from "../glue/router";
import { downloadFile, sleep } from "../../common/misc";
import { fetchCors } from "../../common/fetch";
import { getPageAlbumInfo } from "../services/album";
import { formatPath } from "../../common/format";
import { fromHTML } from "../../common/dom";

onAlbumRoute(() => {
	// Select scan gallery tab by default.
	document.querySelector<HTMLElement>("a[rel='cover_gallery']")?.click();

	const coverGalleryEl = document.querySelector<HTMLElement>("#cover_gallery")!;
	const downloadButtonEl = fromHTML(`<a class="ame-download-scans">Download all scans</a>`);
	coverGalleryEl.insertAdjacentElement("afterbegin", downloadButtonEl);

	let downloading = false;
	downloadButtonEl.addEventListener("click", async () => {
		if (downloading) return;
		downloading = true;

		try {
			downloadButtonEl.dataset["status"] = "loading";
			await downloadScans();
			downloadButtonEl.dataset["status"] = "success";
		} catch (err) {
			downloadButtonEl.dataset["status"] = "error";
			console.error(err);
		}

		downloading = false;
	});
});

async function downloadScans() {
	const zip = new JSZip();

	const album = getPageAlbumInfo();
	if (!album) return;

	const scanEls = Array.from(document.querySelectorAll<HTMLLinkElement>(`#cover_gallery a[href^="https://media.vgm.io"]`));
	for (const scanEl of scanEls) {
		const data =  await fetchCors(scanEl.href).then(res => res.blob());
		const filename = scanEl.querySelector('h4')!.innerText.trim();
		zip.file(formatPath(`${filename}.jpg`), data);
		await sleep(100);
	}

	const foldername = formatPath(`Scans {${album.catalog || album.barcode || album.id}}`);
	downloadFile(await zip.generateAsync({ type: "blob" }), `${foldername}.zip`);
}
