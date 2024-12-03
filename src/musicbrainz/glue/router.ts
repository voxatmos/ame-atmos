import { RouteCallback, onRoute } from "../../common/router";

const RELEASE_PATTERN = "release/[0-9a-f-]+";
const RELEASE_VIEW_COVER_PATTERN = "release/[0-9a-f-]+/cover-art";
const RELEASE_ADD_COVER_PATTERN = "release/[0-9a-f-]+/add-cover-art";

export function onReleaseRoute(cb: RouteCallback) {
	onRoute(RELEASE_PATTERN, cb);
}

export function onReleaseViewCoverRoute(cb: RouteCallback) {
	onRoute(RELEASE_VIEW_COVER_PATTERN, cb);
}

export function onReleaseAddCoverRoute(cb: RouteCallback) {
	onRoute(RELEASE_ADD_COVER_PATTERN, cb);
}
