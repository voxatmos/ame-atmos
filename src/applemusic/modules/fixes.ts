import { waitForVariable } from "../../common/misc";
import { exposeAsyncFunction, imposedWindow } from "../../common/patch";
import { MusicKit } from "../types";

// Fix CTRL+A not working in search field.
document.addEventListener("keydown", (e) => {
	const target = e.target as HTMLInputElement;
	if (!target.matches("input.search-input__text-field")) return;

	e.stopPropagation();
	e.stopImmediatePropagation();
});

// Fix preview queue not working when logged out.
waitForVariable(() => imposedWindow.MusicKit)
	.then((music) => music.getInstance())
	.then((music) => {
		music.addEventListener("playbackStateDidChange", exposeAsyncFunction(async (e) => {
			if (music.isAuthorized) return;
		    if (e.state !== MusicKit.PlaybackStates.ended) return;
		    await music.skipToNextItem();
		}));
	});
