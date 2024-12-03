// ==UserScript==
// @namespace   ame-musicbrainz-works
// @name        Ame (MusicBrainz - Works)
// @version     0.4.2
// @author      SuperSaltyGamer
// @run-at      document-end
// @match       https://musicbrainz.org/*
// @match       https://beta.musicbrainz.org/*
// @match       https://www.minc.or.jp/*
// @match       https://iswcnet.cisac.org/*
// @match       https://www2.jasrac.or.jp/*
// @grant       GM.addStyle
// @grant       GM.xmlHttpRequest
// @grant       GM.setValue
// @grant       GM.getValue
// @grant       GM.deleteValue
// ==/UserScript==

import { sleep } from "../common/misc";
import { onIswcNetPages, onIswcNetSearchPage } from "./modules/iswcnet";
import { onJasracSearchPage, onJasracWorkPage } from "./modules/jasrac";
import { onMincPages, onMincSearchPage, onMincWorkListPage, onMincWorkPage } from "./modules/minc";
import { onMusicBrainzEditRelationshipsPage, onMusicBrainzEditWorkPage } from "./modules/musicbrainz";
import styles from "./style.css?inline";

GM.addStyle(styles);

const queryParams = new URLSearchParams(location.search);

window.addEventListener("focus", async () => {
	await sleep(100);
	if (!window.document.hasFocus() && !window.top?.document.hasFocus()) return;

	if (location.host.endsWith("musicbrainz.org")) {
		if (location.pathname.startsWith("/release/") && location.pathname.endsWith("/edit-relationships")) {
			await onMusicBrainzEditRelationshipsPage();
		} else if (location.pathname.startsWith("/work/") && location.pathname.endsWith("/edit") || location.pathname.startsWith("/dialog") && queryParams.get("path")?.startsWith("/work/create")) {
			await onMusicBrainzEditWorkPage();
		}
	} else if (location.host.endsWith("minc.or.jp")) {
		await onMincPages();

		if (location.pathname.startsWith("/search")) {
			await onMincSearchPage();
		} else if (location.pathname.startsWith("/music/list")) {
			await onMincWorkListPage();
		} else if (location.pathname.startsWith("/saku/detail")) {
			await onMincWorkPage();
		}
	} else if (location.host.endsWith("cisac.org")) {
		await onIswcNetPages();

		if (location.pathname.startsWith("/search")) {
			await onIswcNetSearchPage();
		}
	} else if (location.host.endsWith("jasrac.or.jp")) {
		if (queryParams.get("trxID") === "F00100") {
			await onJasracSearchPage();
		} else if (queryParams.get("trxID") === "F20101") {
			await onJasracWorkPage();
		}
	}
});

window.dispatchEvent(new Event("focus"));
