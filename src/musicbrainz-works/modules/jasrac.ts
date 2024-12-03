import { pathSelector, pathSelectorAll } from "../../common/dom";
import { sleep } from "../../common/misc";
import { MessageType, updateBusValue } from "../bus";
import { beep, setReactInputValue } from "../utils";

export async function onJasracSearchPage() {
	return updateBusValue(MessageType.Work, async (work) => {
		if (!work?.name) return;

		const titleEl = document.querySelector<HTMLInputElement>("input[name='IN_WORKS_TITLE_NAME1']")!;
		const searchEl = document.querySelector<HTMLButtonElement>("button[name='CMD_SEARCH']")!;
		if (titleEl.value === work.name) return;

		setReactInputValue(titleEl, work.name);
		searchEl.click();
	});
}

export async function onJasracWorkPage() {
	return updateBusValue(MessageType.Work, async (work) => {
		const deliveryEl = document.querySelector<HTMLElement>("a[href='#tab-00-07']")!;
		deliveryEl.click();

		await sleep(300);

		const iswc = pathSelector(document, "//*[contains(@class, 'baseinfo--iswc')]//strong")?.innerText?.trim() || null;
		const jasrac = pathSelector(document, "//*[contains(@class, 'baseinfo--code')]//strong")?.innerText?.trim() || null;

		const lyricists = pathSelectorAll(document, "//table[contains(@class, 'detail')]//td[contains(., '作詞')]/parent::tr/*[2]").map(getCredit).filter(Boolean).filter(value => value !== "識別");
		const composers = pathSelectorAll(document, "//table[contains(@class, 'detail')]//td[contains(., '作曲')]/parent::tr/*[2]").map(getCredit).filter(Boolean).filter(value => value !== "識別");
		const arrangers = pathSelectorAll(document, "//table[contains(@class, 'detail')]//td[contains(., '編曲')]/parent::tr/*[2]").map(getCredit).filter(Boolean).filter(value => value !== "識別");
		const publishers = pathSelectorAll(document, "//table[contains(@class, 'detail')]//td[contains(., '出版者')]/parent::tr/*[2]").map(getCredit).filter(Boolean).filter(value => value !== "識別");

		if (iswc) work.iswc = iswc;
		if (jasrac) work.codes.jasrac = jasrac;
		work.lyricists = Array.from(new Set(lyricists));
		work.composers = Array.from(new Set(composers));
		work.arrangers = Array.from(new Set(arrangers));
		work.publishers = Array.from(new Set(publishers));
		work.sources.push(location.href);
		work.sources = Array.from(new Set(work.sources));
	});
}

function getCredit(el: HTMLElement): string {
	return el.textContent?.split("\n")[0]?.trim() ?? "";
}
