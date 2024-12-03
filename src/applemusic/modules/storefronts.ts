import { sleep } from "../../common/misc";
import { fromHTML, waitQuerySelector } from "../../common/dom";
import flagIcon from "../assets/icons/flag.svg?raw";
import { offAlbumRoute, onAlbumRoute } from "../glue/router";
import { createButtonElement, hideSidebarButton, showSidebarButton } from "../glue/sidebar";
import { getAlbum, getPageAlbumId } from "../services/album";
import { getStorefronts } from "../services/storefront";

const PREFERRED_STOREFRONTS = [ "jp", "kr", "us", "nz", "au", "de", "fr", "gb", "in", "it", "es", "br", "cn", "hk" ];
PREFERRED_STOREFRONTS.reverse();

let globalJob: AbortController | null = null;

const checkStorefrontsButtonEl = createButtonElement("Check Storefronts", flagIcon);

checkStorefrontsButtonEl.addEventListener("click", async () => {
	// Only allow when album page loaded successfully.
	const refEl = document.querySelector<HTMLElement>(".section");
	if (refEl) await checkCountries(refEl);
});

onAlbumRoute(async () => {
	const errorEl = await waitQuerySelector(".page-error");
	if (errorEl) await checkCountries(errorEl);
});

onAlbumRoute(() => {
	showSidebarButton(checkStorefrontsButtonEl, 100);
	globalJob?.abort();
	globalJob = null;
});

offAlbumRoute(() => {
	hideSidebarButton(checkStorefrontsButtonEl);
	globalJob?.abort();
	globalJob = null;
});

async function checkCountries(refEl: HTMLElement) {
	if (globalJob) return;
	const job = new AbortController();
	globalJob = job;

	const albumId = getPageAlbumId();

	const headerEl = fromHTML(`<div class="section ame-album-storefronts-header">Availability in the following storefronts:</div>`);
	const containerEl = fromHTML(`
		<div class="section ame-album-storefronts-container">
			<div class="ame-color-primary"></div>
			<div class="ame-color-secondary"></div>
			<div class="ame-color-tertiary"></div>
		</div>
	`);

	const primaryContainerEl = containerEl.children[0] as HTMLElement;
	const secondaryContainerEl = containerEl.children[1] as HTMLElement;
	const tertiaryContainerEl = containerEl.children[2] as HTMLElement;

	refEl.append(headerEl);
	refEl.append(containerEl);

	let storefronts = await getStorefronts();

	storefronts = storefronts
		.map(storefront => {
			storefront.attributes.name = storefront.attributes.name.split(", ").slice(0, 1).join(" ");
			return storefront;
		})
		.sort((a, b) => {
			return Math.max(PREFERRED_STOREFRONTS.indexOf(b.id), 0) - Math.max(PREFERRED_STOREFRONTS.indexOf(a.id), 0);
		});

	for (const storefront of storefronts) {
		if (job.signal.aborted) break;

		const album = await getAlbum(albumId, storefront.id);

		// Album totally unavailable.
		if (!album) {
			tertiaryContainerEl.append(fromHTML(`<span data-storefront="${storefront.id}" title="Totally unavailable">${storefront.attributes.name}, </span>`));
			await sleep(250);
			continue;
		}

		const discCount = Math.max(...album.relationships.tracks.data.map(track => track.attributes.discNumber));
		const songTracks = album.relationships.tracks.data.filter(track => track.type === "songs");
		const otherTracks = album.relationships.tracks.data.filter(track => track.type !== "songs");
		const unavailableTracks = new Set();
		for (let i = 1; i <= album.attributes.trackCount - otherTracks.length; i++) unavailableTracks.add(i);

		songTracks.forEach((track, i) => {
			if (!track.attributes.extendedAssetUrls) return;
			if (!track.attributes.playParams) return;
			unavailableTracks.delete(discCount > 1 ? i + 1 : track.attributes.trackNumber);
		});

		// Album partially available.
		if (unavailableTracks.size) {
			const missingText = discCount > 1
				? `${unavailableTracks.size} tracks`
				: Array.from(unavailableTracks).join(", ");

			secondaryContainerEl.append(fromHTML(`<span data-storefront="${storefront.id}"><a target="_blank" href="https://music.apple.com/${storefront.id}/album/${albumId}" title="Partially available, missing:\n${missingText}">${storefront.attributes.name}</a>, </span>`));

			await sleep(250);
			continue;
		}

		// Album fully available.
		primaryContainerEl.append(fromHTML(`<span data-storefront="${storefront.id}"><a target="_blank" href="https://music.apple.com/${storefront.id}/album/${albumId}" title="Fully available">${storefront.attributes.name}</a>, </span>`));

		await sleep(250);
	}
}
