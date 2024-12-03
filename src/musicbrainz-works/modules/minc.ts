import { pathSelector, pathSelectorAll } from "../../common/dom";
import { MessageType, updateBusValue } from "../bus";
import { beep, makeFuzzyRegex, markPattern } from "../utils";

export function onMincPages() {
	const logoEl = document.querySelector<HTMLAnchorElement>(".logo > a");
	if (logoEl) logoEl.href = `${location.origin}/search`;
}

export function onMincSearchPage() {
	return updateBusValue(MessageType.Work, async (work) => {
		if (!work.name) return;

		const workNameEl = document.querySelector<HTMLInputElement>("#kyokunm")!;
		const searchWorkEl = document.querySelector<HTMLButtonElement>("#search-by-track-and-artist")!;

		workNameEl.value = work.name;
		searchWorkEl.click();
	});
}

export function onMincWorkListPage() {
	for (const buttonEl of document.querySelectorAll(".saku-detail-link")) {
		const anchorEl = document.createElement("a");
		anchorEl.target = "_blank";
		anchorEl.href = `/saku/detail/?${buttonEl.getAttribute("data-href")}`;
		anchorEl.innerHTML = buttonEl.innerHTML;
		buttonEl.replaceWith(anchorEl);
	}

	return updateBusValue(MessageType.Work, async (work) => {
		for (const token of work.context.tokens) {
			const tokenPattern = makeFuzzyRegex(token);
			for (const cellEl of document.querySelectorAll("#track-list tr td:nth-child(3), #track-list tr td:nth-child(4)")) markPattern(cellEl, tokenPattern);
		}

		if (work.name) for (const cellEl of document.querySelectorAll("#track-list tr td:nth-child(2)")) markPattern(cellEl, makeFuzzyRegex(work.name));

		const workNameEl = document.querySelector<HTMLInputElement>("#kyokunm")!;
		const searchWorkEl = document.querySelector<HTMLButtonElement>("#search-by-track-and-artist")!;

		if (!work.name || workNameEl.value === work.name) return;

		workNameEl.value = work.name;
		searchWorkEl.click();
	});
}

export function onMincWorkPage() {
	return updateBusValue(MessageType.Work, async (work) => {
		const iswc = pathSelector(document, "//h3/text()[.!='-']")?.nodeValue?.replaceAll(" ", "") || null;
		const jasrac = pathSelector(document, "//a[@href='#jasrac']/following-sibling::*/span[2][.!='']")?.innerText?.trim() || null;
		const nextone = pathSelector(document, "//a[@href='#nextone']/following-sibling::*/span[2][.!='']")?.innerText?.trim() || null;
		const lyricists = pathSelectorAll(document, "//div[contains(@class, 'management')]//td[contains(., '作詞')]/parent::tr/*[2]").map(getCredit).filter(Boolean);
		const composers = pathSelectorAll(document, "//div[contains(@class, 'management')]//td[contains(., '作曲')]/parent::tr/*[2]").map(getCredit).filter(Boolean);
		const arrangers = pathSelectorAll(document, "//div[contains(@class, 'management')]//td[contains(., '編曲')]/parent::tr/*[2]").map(getCredit).filter(Boolean);
		const publishers = pathSelectorAll(document, "//div[contains(@class, 'management')]//td[contains(., '出版者')]/parent::tr/*[2]").map(getCredit).filter(Boolean);

		if (iswc) work.iswc = iswc;
		if (jasrac) work.codes.jasrac = jasrac;
		if (nextone) work.codes.nextone = nextone;
		work.lyricists = Array.from(new Set(lyricists));
		work.composers = Array.from(new Set(composers));
		work.arrangers = Array.from(new Set(arrangers));
		work.publishers = Array.from(new Set(publishers));
		work.sources.push(location.href);
		work.sources = Array.from(new Set(work.sources));
	});
}

function getCredit(el: HTMLElement): string {
	return el.firstChild?.textContent?.split("\n")[0]?.replace(/\s*\/\s*$/, "")?.trim() ?? "";
}
