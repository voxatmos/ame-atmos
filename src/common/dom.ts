export function fromHTML<T extends HTMLElement>(value: string): T {
	const el = document.createElement("template");
    el.innerHTML = value;
    return el.content.firstElementChild as T;
}

interface WaitForOptions {
	waitSelector?: string;
	timeout?: number;
}

export function waitQuerySelector<T extends HTMLElement>(selector: string, options?: WaitForOptions): Promise<T | null> {
	return new Promise((resolve) => {
		const waitSelector = options?.waitSelector;
		const timeout = options?.timeout ?? 3000;

		if (timeout !== 0) {
			const el = document.querySelector<T>(selector);
			if (el) {
				resolve(el);
				return;
			}
		}

		const disposeTimeout = setTimeout(() => {
			if (timeout === 0) return;
			observer.disconnect();
			resolve(null);
		}, timeout);

		const observer = new MutationObserver(mutations => {
			for (const mutation of mutations) {
				for (const node of Array.from(mutation.addedNodes)) {
					if (!(node instanceof Element)) continue;
					if (!node.matches(waitSelector ?? selector)) continue;

					if (timeout !== 0) {
						observer.disconnect();
						clearTimeout(disposeTimeout);
					}

					resolve(waitSelector ? document.querySelector<T>(selector) : node as T);
					return;
				}
			}
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true
		});
	});
}

export function observeQuerySelector<T extends HTMLElement>(query: string, cb: (el: T) => void) {
	const observer = new MutationObserver(async (mutations) => {
		for (const mutation of mutations) {
			for (const node of mutation.addedNodes) {
				if (!(node instanceof HTMLElement)) continue;
				const childEl = node.matches(query) ? node : node.querySelector<HTMLElement>(query);
				if (!childEl) continue;
				await cb(childEl as T);
			}
		}
	});

	observer.observe(document.body, {
		childList: true,
		subtree: true
	});
}

export function pathSelector<T extends HTMLElement>(el: Node, path: string): T | null {
	return document.evaluate(path, el, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue as T;
}

export function pathSelectorAll<T extends HTMLElement>(el: Node, path: string): T[] {
	const snapshot = document.evaluate(path, el, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	return Array.from({ length: snapshot.snapshotLength }, (_, i) => snapshot.snapshotItem(i) as T);
}
