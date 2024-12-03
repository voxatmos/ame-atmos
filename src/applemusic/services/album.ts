import { fetchCors } from "../../common/fetch";
import { Album, ApiResponse, Resource } from "../types";
import { getAuthToken } from "./auth";
import { getPageStorefront } from "./storefront";

export function getPageAlbumId(): string {
	return location.pathname.split("/")[4];
}

export async function getAlbum(id: string, storefront?: string): Promise<Resource<Album> | null> {
	storefront ??= getPageStorefront();

	const res = await fetchCors(`https://amp-api.music.apple.com/v1/catalog/${storefront}/albums/${id}?extend=extendedAssetUrls`, {
		headers: {
			"Origin": "https://music.apple.com",
			"Referer": "https://music.apple.com/",
			"Authorization": `Bearer ${await getAuthToken()}`
		}
	});
	if (res.status === 404) return null;

	const albums = await res.json<ApiResponse<Album>>();
	return albums.data[0];
}
