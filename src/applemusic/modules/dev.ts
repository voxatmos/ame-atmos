import shieldIcon from "../assets/icons/shield.svg?raw";
import { createButtonElement, showSidebarButton } from "../glue/sidebar";
import { getAuthToken } from "../services/auth";

const copyAuthButtonEl = createButtonElement("Copy Authorization", shieldIcon);

copyAuthButtonEl.addEventListener("click", async () => {
	GM.setClipboard(await getAuthToken());
});

showSidebarButton(copyAuthButtonEl, 0);
