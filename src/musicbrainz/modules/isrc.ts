import { onReleaseRoute } from "../glue/router";
import { getPageReleaseId, getPageReleaseInfo } from "../services/release";

const ISRC_PATTERN = /[A-Z]{2}-?[A-Z0-9]{3}-?[0-9]{2}-?[0-9]{5}/g;
const queryEl = document.querySelector<HTMLInputElement>("#headerid-query")!;

onReleaseRoute(() => {
	queryEl.addEventListener("input", () => {
		const codes = extractRecordingCodes(queryEl.value);
		if (codes.length === 0) return;

		const releaseInfo = getPageReleaseInfo();
		if (releaseInfo == null) return;
		if (codes.length !== releaseInfo.trackCounts.reduce((sum, count) => sum + count, 0)) return;

		queryEl.value = "";
		location.href = generateKepstinUrl(getPageReleaseId(), codes);
	});
});

function extractRecordingCodes(text: string): string[] {
	const matches = text.matchAll(ISRC_PATTERN);
	return Array.from(matches).map(match => match[0]);
}

function generateKepstinUrl(releaseId: string, codes: string[]): string {
	let url = `https://magicisrc.kepstin.ca?mbid=${releaseId}`;
	for (let i = 0; i < codes.length; i++) url += `&isrc${i + 1}=${codes[i]}`;
	return url;
}
