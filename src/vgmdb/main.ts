// ==UserScript==
// @namespace   ame-vgmdb
// @name        Ame (VGMdb)
// @version     1.1.9
// @author      SuperSaltyGamer
// @run-at      document-end
// @match       https://vgmdb.net/*
// @grant       GM.addStyle
// @grant       GM.xmlHttpRequest
// ==/UserScript==

import "./modules/scans";
import "./modules/related";
import styles from "./style.css?inline";

GM.addStyle(styles);
