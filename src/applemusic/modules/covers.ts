import paletteIcon from "../assets/icons/palette.svg?raw";
import { offAlbumRoute, onAlbumRoute } from "../glue/router";
import { createButtonElement, hideSidebarButton, showSidebarButton } from "../glue/sidebar";

export const searchCoversButtonEl = createButtonElement("Search Covers", paletteIcon);

searchCoversButtonEl.addEventListener("click", () => {
	const artistEl = document.querySelector<HTMLElement>(".headings__subtitles > a");
	const titleEl = document.querySelector<HTMLElement>(".headings__title");
	if (!titleEl) return;

	const artist = artistEl?.innerText.trim();
	const album = titleEl.innerText.trim().replace(/ - Single$/i, "").replace(/ - EP$/i, "");

	const params = new URLSearchParams();
	if (artist) params.set("artist", artist);
	params.set("album", album);

	open(`https://covers.musichoarders.xyz?${params}`, "_blank");
});

onAlbumRoute(() => {
	showSidebarButton(searchCoversButtonEl, 400);
});

offAlbumRoute(() => {
	hideSidebarButton(searchCoversButtonEl);
});

// Replace release cover image with full sized variant on right click.
addEventListener("mousedown", async e => {
	if (e.button !== 2) return;

	const imgEl = e.target as HTMLImageElement;
	if (!imgEl.matches(".artwork-component__image:not(.ame-full-sized)")) return;
	imgEl.classList.add("ame-full-sized");

	const refSrcEl = document.querySelector<HTMLSourceElement>(".artwork__radiosity source");
	if (!refSrcEl) return;

	const srcEls = imgEl.parentElement!.querySelectorAll<HTMLSourceElement>("source");
	for (const srcEl of Array.from(srcEls)) srcEl.srcset = transformCover(refSrcEl.srcset);
}, { passive: true });

function transformCover(url: string): string {
	return url
		.split(" ", 2)[0]
		.replace(/is\d-ssl/, "a1")
		.replace("image/thumb", "r40")
		.split("/")
		.slice(0, -1)
		.join("/");
}
