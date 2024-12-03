interface MenuElement extends HTMLElement {
	addMenuItem<TElement extends HTMLElement>(el: TElement, index: number): TElement
}

export function ensureMenu(selector: string, cb: () => void): MenuElement {
	let refEl = document.querySelector<MenuElement>(selector);
	if (refEl) return createMenu(refEl);

	try {
		cb();
	} catch {
		console.error(`Could not create menu reference element for selector "${selector}".`);
	}

	refEl = document.querySelector<MenuElement>(selector);
	if (refEl) return createMenu(refEl);

	throw new Error(`Could not find menu reference element by selector "${selector}".`);
}

function createMenu(menuEl: HTMLElement & MenuElement): MenuElement {
	menuEl.addMenuItem = (el, index) => {
		let refEl: HTMLElement = menuEl;

		for (let limit = 0; limit < 100; limit++) {
			const nextRefEl = refEl.nextElementSibling as HTMLElement;
			if (!nextRefEl) break;
			if (Number(nextRefEl.getAttribute("data-index")) > index) break;
			refEl = nextRefEl;
		}

		el.setAttribute("data-index", index.toString());
		refEl.after(el);
		return el;
	};

	return menuEl;
}
