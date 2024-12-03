import { observeQuerySelector, pathSelector, waitQuerySelector } from "../../common/dom";
import { sleep } from "../../common/misc";
import { MessageType, pullBusValue, pushBusValue } from "../bus";
import { beep, makeFuzzyRegex, markChange, markPattern, setReactInputValue } from "../utils";

let done = false;

export function onMusicBrainzEditRelationshipsPage() {
	setupDropdownHighlight();

	observeQuerySelector("#add-relationship-dialog", async (el) => {
		const searchEl = pathSelector<HTMLButtonElement>(el, "//td[.='Work']/following-sibling::td//button");
		await sleep(100);
		searchEl?.click();
	});
}

export async function onMusicBrainzEditWorkPage() {
	setupDropdownHighlight();

	const nameEl = markChange(document.querySelector<HTMLInputElement>("#id-edit-work\\.name")!);
	const iswcEl = markChange(document.querySelector<HTMLInputElement>("input[name='edit-work.iswcs.0']")!);
	const noteEl = document.querySelector<HTMLTextAreaElement>("#id-edit-work\\.edit_note")!;

	const work = await pullBusValue(MessageType.Work);
	if (!work?.sources.length) {
		if (!done) {
			await pushBusValue(MessageType.Work, {
				name: nameEl.value || null,
				iswc: iswcEl.value || null,
				codes: {
					external: false,
					jasrac: null,
					nextone: null
				},
				lyricists: [],
				composers: [],
				arrangers: [],
				publishers: [],
				sources: [],
				context: {
					tokens: Array.from(getArtistsOnPage(parent === window ? document.body : parent.document.body))
				}
			});
		}

		return;
	}

	done = true;

	if (work.iswc) setReactInputValue(iswcEl, work.iswc);
	if (work.codes.jasrac) setWorkCode("jasrac", work.codes.jasrac);
	if (work.codes.nextone) setWorkCode("nextone", work.codes.nextone);
	if (work.sources.length) noteEl.value = `Filled out with Ame (MusicBrainz - Works):\n${work.sources.join("\n")}\n`;

	if (work.codes.external) {
		const pasteWorkCodesEl = document.querySelector<HTMLButtonElement>("#ROpdebee_MB_Paste_Work");
		pasteWorkCodesEl?.click();
	}

	for (const lyricist of work.lyricists) await addRelationship("artist", "lyrics / lyricist", lyricist);
	for (const composer of work.composers) await addRelationship("artist", "composed / composer", composer);
	for (const arranger of work.arrangers) await addRelationship("artist", "arranged / arranger", arranger);
	for (const publisher of work.publishers) await addRelationship("label", "published / publisher", publisher.replace("株式会社", "").trim());
}

function setupDropdownHighlight() {
	observeQuerySelector("ul[id^='relationship-target']", async (listEl) => {
		const observer = new MutationObserver(async (mutations) => {
			const mutation = mutations[0];
			const visibility = listEl.style.visibility;
			if (visibility === "hidden" || visibility === mutation.oldValue) return;

			const itemEl = listEl.firstElementChild as HTMLElement | null;
			if (itemEl?.innerText.includes("Click here to try again")) {
				await sleep(100);
				itemEl.click();
				return;
			}

			const searchLabelEl = document.getElementById(listEl.getAttribute("aria-labelledby")!) as HTMLLabelElement;
			const searchValueEl = searchLabelEl.control! as HTMLInputElement;

			const tokens = getArtistsOnPage();
			if (searchValueEl.value) tokens.add(searchValueEl.value);

			for (const token of tokens) {
				const tokenPattern = makeFuzzyRegex(token);
				for (const itemEl of listEl.children) markPattern(itemEl, tokenPattern);
			}
		});

		observer.observe(listEl, {
			attributes: true,
			attributeOldValue: true,
			attributeFilter: [ "style" ]
		});
	});
}

function getArtistsOnPage(rootEl: HTMLElement = document.body): Set<string> {
	return new Set(Array.from(rootEl.querySelectorAll<HTMLElement>("a[href^='/artist/'][title]")).map(el => el.innerText.trim()));
}

async function addRelationship(relatedType: string, relationshipType: string, value: string) {
	const addRelationshipEl = document.querySelector<HTMLButtonElement>("button.add-relationship")!;
	addRelationshipEl.click();

	const dialogEl = await waitQuerySelector("#add-relationship-dialog");
	if (!dialogEl) return;

	const relatedTypeEl = dialogEl.querySelector<HTMLSelectElement>("select.entity-type")!;
	setReactInputValue(relatedTypeEl, relatedType);

	const relationshipTypeEl = dialogEl.querySelector<HTMLInputElement>("input.relationship-type")!;
	setReactInputValue(relationshipTypeEl, relationshipType);

	pathSelector<HTMLLIElement>(dialogEl, `//li[contains(@class, 'option-item') and contains(., '${relationshipType}')]`)!.click();

	const targetEl = dialogEl.querySelector<HTMLInputElement>(".relationship-target input")!;
	setReactInputValue(targetEl, value);
	await sleep(300);

	const targetSearchEl = dialogEl.querySelector<HTMLButtonElement>(".relationship-target button")!;
	targetSearchEl.click();

	await new Promise<void>((resolve) => {
		const negativeEl = dialogEl.querySelector<HTMLButtonElement>("button.negative")!;
		const positiveEl = dialogEl.querySelector<HTMLButtonElement>("button.positive")!;
		negativeEl.addEventListener("click", () => resolve());
		positiveEl.addEventListener("click", () => resolve());
	});

	await sleep(300);
}

function setWorkCode(key: string, value: string) {
    key = key.toLowerCase();

    const addWorkEl = document.querySelector<HTMLButtonElement>("#add-work-attribute")!;

    for (let attempt = 0; attempt < 2; attempt++) {
        for (const rowEl of document.querySelectorAll("#work-attributes tr:not(:last-child)")) {
            const rowKeyEl = rowEl.querySelector("select")!;
            const selectedOption = rowKeyEl.selectedOptions[0];
            const targetOption = Array.from(rowKeyEl!.options)
                .filter(option => option.innerText.trim().toLowerCase().startsWith(key))[0];

            if (selectedOption !== targetOption && selectedOption.value) continue;

            targetOption.selected = true;
            const rowValueEl = markChange(rowEl.querySelector("input")!);
            rowValueEl.value = value;

            return;
        }

        addWorkEl.click();
        setWorkCode(key, value);
    }
}
