import seedIcon from "../assets/icons/seed.svg?raw";
import { offAlbumRoute, onAlbumRoute } from "../glue/router";
import { createButtonElement, hideSidebarButton, showSidebarButton } from "../glue/sidebar";

export const seedButtonEl = createButtonElement("Seed MusicBrainz", seedIcon);

seedButtonEl.addEventListener("click", () => {
	open(`https://seed.musichoarders.xyz?identifier=${encodeURIComponent(location.href)}`, "_blank");
});

onAlbumRoute(() => {
	showSidebarButton(seedButtonEl, 500);
});

offAlbumRoute(() => {
	hideSidebarButton(seedButtonEl);
});
