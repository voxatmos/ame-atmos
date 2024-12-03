import { onRoute } from "../../common/router";
import { RouteCallback } from "../../common/router";

const ALBUM_PATTERN = "album/.+";

export function onAlbumRoute(cb: RouteCallback) {
	onRoute(ALBUM_PATTERN, cb);
}
