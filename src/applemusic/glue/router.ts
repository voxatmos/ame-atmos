import { offRoute, onRoute } from "../../common/router";
import { RouteCallback } from "../../common/router";

const ALBUM_PATTERN = "[a-z]{2}/album/.+/.+";

export function onAlbumRoute(cb: RouteCallback) {
	onRoute(ALBUM_PATTERN, cb);
}

export function offAlbumRoute(cb: RouteCallback) {
	offRoute(ALBUM_PATTERN, cb);
}
