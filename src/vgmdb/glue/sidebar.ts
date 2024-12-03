export function addAlbumSidebarButton(index: number, icon: string, title: string, link: string): HTMLElement {
	let refEl = document.querySelector("#ame-section");
	if (!refEl) {
		const sectionEls = document.querySelectorAll("#rightcolumn > br");
		sectionEls[0].insertAdjacentHTML("afterend", `
			<div style="width: 250px; background-color: #1B273D">
				<b class="rtop"><b></b></b>
				<div style="padding: 6px 10px 0px 10px">
					<h3>Ame</h3>
				</div>
			</div>
			<div style="width: 250px; background-color: #2F364F;">
				<div class="smallfont" style="padding: 10px 10px 6px 10px">
					<div id="ame-section"></div>
				</div>
				<b class="rbot"><b></b></b>
			</div>
			<br>
		`);

		refEl = document.querySelector("#ame-section")!;
	}

	while (true) {
		const nextRefEl = refEl.nextElementSibling as HTMLElement;
		if (!nextRefEl) break;
		if (Number(nextRefEl.getAttribute("data-index")) > index) break;
		refEl = nextRefEl;
	}

	refEl.insertAdjacentHTML("afterend", `
		<span data-index="${index}" style="display: block; clear: both; min-height: 16px; line-height: 16px; margin-bottom: 4px; padding-left: 20px; background: transparent url('${icon}') top left no-repeat; background-size: 16px 16px;" class="smallfont">
			<a href="${link}">${title}</a>
		</span>
	`);

	return refEl.nextElementSibling!.querySelector<HTMLElement>("a")!;
}
