import { fetchCors } from "../../common/fetch";
import { ApiResponse, Lyrics, Resource } from "../types";
import { getAuthToken } from "./auth";
import { getPageStorefront } from "./storefront";

export async function getLyrics(id: string, syllable: boolean, storefront?: string): Promise<Resource<Lyrics> | null> {
	storefront ??= getPageStorefront();

	const res = await fetchCors(`https://amp-api.music.apple.com/v1/catalog/${storefront}/songs/${id}/${syllable ? "syllable-lyrics" : "lyrics"}`, {
		headers: {
			"Origin": "https://music.apple.com",
			"Referer": "https://music.apple.com/",
			"Authorization": `Bearer ${await getAuthToken()}`
		}
	});
	if (res.status === 404) return null;

	const lyrics = await res.json<ApiResponse<Lyrics>>();
	return lyrics.data[0];
}
