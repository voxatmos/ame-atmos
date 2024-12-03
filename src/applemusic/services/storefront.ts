import { fetchCors } from "../../common/fetch";
import { readCookies } from "../../common/misc";
import { ApiResponse, Resource, Storefront } from "../types";
import { getAuthToken } from "./auth";

export function getPageStorefront(): string {
	return location.pathname.split("/")[1];
}

export function getAccountStorefront(): string | null {
	const cookies = readCookies();
	return cookies["itua"] || null;
}

export async function getStorefronts(): Promise<Resource<Storefront>[]> {
	const res = await fetchCors("https://api.music.apple.com/v1/storefronts", {
		headers: {
			"Origin": "https://music.apple.com",
			"Referer": "https://music.apple.com/",
			"Authorization": `Bearer ${await getAuthToken()}`
		}
	});
	const body = await res.json<ApiResponse<Storefront>>();
	return body.data;
}
