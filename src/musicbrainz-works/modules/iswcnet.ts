import { fromHTML, observeQuerySelector, pathSelector, waitQuerySelector } from "../../common/dom";
import { sleep } from "../../common/misc";
import { MessageType, updateBusValue } from "../bus";
import { beep, setReactInputValue } from "../utils";

export async function onIswcNetPages() {
	// Skip language selection after captcha.
	observeQuerySelector("a[class^='LandingPage_languageButton__']", () => {
		location.href = "/search";
	});
}

export async function onIswcNetSearchPage() {
	let captcha = false;

	await updateBusValue(MessageType.Work, async (work) => {
		if (!work.iswc) return;

		const iswcEl = document.querySelector<HTMLInputElement>("#iswc")!;
		const searchEl = document.querySelector<HTMLButtonElement>("button[type='submit']")!;

		setReactInputValue(iswcEl, work.iswc);
		await sleep(800);
		searchEl?.click();
		await sleep(500);

		captcha = await Promise.any([
			waitQuerySelector("div[class^='Search_resultsContainer__'] div[class^='AlertMessage_text__']").then(() => true),
			waitQuerySelector("[class^='Search_sectionTitle__']").then((el) => !el)
		]);

		if (captcha) return;

		const moreEl = document.querySelector<HTMLButtonElement>("[id='View More']")!;
		moreEl.click();

		await sleep(100);

		const copyEl = pathSelector(document, "//button[.='Copy work codes']");
		if (!copyEl) {
			moreEl.after(fromHTML(`<div style="padding: .5rem;">Install <a href="https://musicbrainz.org/doc/Guides/Userscripts#Userscripts:_Works">Bulk copy-paste work codes</a> for better integration.</div>`));
		} else {
			copyEl.click();
			work.codes.external = true;
		}

		work.sources.push(location.href);
		work.sources = Array.from(new Set(work.sources));
	});

	// Skip to captcha on error.
	if (captcha) location.href = "/";
}
