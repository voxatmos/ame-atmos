import { fromHTML } from "../../common/dom";
import { ensureMenu } from "../../common/menu";

function addSidebarElement(refSelector: string, index: number, icon: string, html: string): HTMLElement {
	const menuEl = ensureMenu("#ame-sidebar", () => {
		const refEl = document.querySelector<HTMLElement>(refSelector)!;
		const sectionTitleEl = fromHTML(`<h2>Ame</h2>`);
		const sectionEl = fromHTML(`
			<ul class="external_links">
				<li id="ame-sidebar" style="display: none;"></li>
			</ul>
		`);

		refEl.before(sectionTitleEl);
		refEl.before(sectionEl);
	});

	const itemEl = fromHTML(`
		<li data-index="${index}" style="background: transparent url('${icon}') center left no-repeat; background-size: 16px 16px;">
			${html}
		</li>
	`);

	return menuEl.addMenuItem(itemEl, 100);
}

export function addReleaseSidebarButton(index: number, icon: string, title: string, link: string): HTMLElement {
	return addSidebarElement(".release-information", index, icon, `<a target="_blank" href="${link}">${title}</a>`);
}
