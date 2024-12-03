// ==UserScript==
// @namespace   ame-applemusic
// @name        Ame (Apple Music)
// @version     1.13.0
// @author      SuperSaltyGamer
// @run-at      document-start
// @match       https://music.apple.com/*
// @match       https://beta.music.apple.com/*
// @grant       GM.addStyle
// @grant       GM.setClipboard
// @grant       GM.xmlHttpRequest
// ==/UserScript==

import handsonStyles from "handsontable/dist/handsontable.full.min.css?inline";
import { waitQuerySelector } from "../common/dom";
import "./modules/badges";
import "./modules/storefronts";
import "./modules/covers";
import "./modules/dev";
import "./modules/qualities";
import "./modules/info";
import "./modules/fixes";
import "./modules/seed";
import styles from "./style.css?inline";

GM.addStyle(handsonStyles);
GM.addStyle(styles);

// Hide trial upsell modal.
waitQuerySelector<HTMLDialogElement>("iframe[src^='/includes/commerce/subscribe']", { timeout: 0 })
	.then((dialogEl) => {
		dialogEl?.remove();
	});
