import { fetchCors } from "../../common/fetch";
import { readCookies } from "../../common/misc";

let cachedAuthToken = "";

export async function getAuthToken(): Promise<string> {
	if (cachedAuthToken) return cachedAuthToken;

	const scriptEl = document.querySelector<HTMLScriptElement>("script[type='module']");
	if (!scriptEl) throw new Error("Failed to find script with auth token.");

	const res = await fetchCors(scriptEl.src);
	const body = await res.text();

	const match = body.match(/(?<=")eyJhbGciOiJ.+?(?=")/);
	if (!match) throw new Error("Failed to find auth token from script.");

	cachedAuthToken = match[0];
	return cachedAuthToken;
}

export function getUserToken(): string | null {
	const cookies = readCookies();
	return cookies["music-user-token"] || null;
}
