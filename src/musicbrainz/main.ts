// ==UserScript==
// @namespace   ame-musicbrainz
// @name        Ame (MusicBrainz)
// @version     1.8.4
// @author      SuperSaltyGamer
// @run-at      document-end
// @match       https://musicbrainz.org/*
// @match       https://beta.musicbrainz.org/*
// @grant       GM.addStyle
// @grant       GM.xmlHttpRequest
// ==/UserScript==

import "./modules/search";
import "./modules/covers";
import "./modules/scans";
import "./modules/related";
import "./modules/isrc";
import styles from "./style.css?inline";

GM.addStyle(styles);
