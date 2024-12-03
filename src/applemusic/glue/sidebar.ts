import { waitQuerySelector } from "../../common/dom";
import { fromHTML } from "../../common/dom";
import { ensureMenu } from "../../common/menu";

type ButtonElement = Branded<HTMLElement, "applemusic-button">;

export function createButtonElement(text: string, icon: string): ButtonElement {
	return fromHTML<ButtonElement>(`
		<li class="ame-sidebar-button navigation-item" data-ame>
			<a class="navigation-item__link" tabindex="0" data-ame>
				${icon}
				<span>${text}</span>
			</a>
		</li>
    `);
}

export async function showSidebarButton(buttonEl: ButtonElement, index: number) {
	await waitQuerySelector("amp-chrome-player"); // Wait for native menus to load.

	const menuEl = ensureMenu("#ame-sidebar", () => {
		const refEl = document.querySelector(".navigation__scrollable-container");
		refEl?.appendChild(fromHTML(`
			<div class="navigation-items" data-ame>
				<div class="navigation-items__header" data-ame>
					<span>Ame</span>
				</div>
				<ul class="navigation-items__list" data-ame>
					<li id="ame-sidebar" style="display: none;"></li>
				</ul>
			</div>
		`));
	});

	menuEl.addMenuItem(buttonEl, index);
}

export async function hideSidebarButton(buttonEl: ButtonElement) {
	buttonEl.remove();
}
