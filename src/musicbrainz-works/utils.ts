const audioCtx = new AudioContext();

const PUNCTUATION_CHARS = new Set(`[᠊᳓‾﹉-﹌_＿﹍-﹏︳︴‗\-－﹣֊᐀᭠᠆᠇‐-–︲—﹘︱―⸺⸻⁓⹃⸗⹀⹝〜゠・･𐺭,，﹐︐⸴⸲⹁⹌⹎⹏՝،؍٫٬߸᠂᠈꓾꘍꛵𖺗、﹑︑､﹅﹆𖿢;;；﹔︔؛⁏⸵꛶⹉\:：﹕︓⩴։؞܃-܈࠰-࠾፡፣-፦᠄᠅༔៖᭝꧇᛫-᛭꛴!！﹗︕¡⹓՜߹᥄𞥞?？﹖︖⁈⁇¿⸮⹔՞؟܉፧᥅⳺⳻꘏꛷꫱𑅃𞥟‽⸘.．․﹒‥︰…︙᠁۔܁܂።᠃᠉᙮᭜⳹⳾⸰⸼꓿꘎꛳𖫵𖺘𛲟。︒｡··⸱⸳।॥꣎꣏᰻᰼꡶꡷᜵᜶꤯၊။។៕᪨-᪫᭞᭟꧈꧉꩝-꩟꫰꯫𐩖𐩗𑁇𑁈𑃀𑃁𑅁𑅂𑇅𑇆𑈸𑈹𑑋𑑌𑗂𑗃𑙁𑙂𑜼𑜽𑥄𑱁𑱂𑽃𑽄𖩮𖩯᱾᱿؝܀߷჻፠፨᨞᨟᭚᭛᭽᭾꧁-꧆꧊-꧍꛲꥟𐡗𐬺-𐬿𐽕-𐽙𐾆-𐾉𑂾𑂿𑅀𑇈𑇞𑇟𑊩𑜾𑥆𑻷𑻸𑽅-𑽏⁕⁖⁘-⁞⸪-⸭⸽⳼⳿⸙𐤿𐄀-𐄂𐎟𐏐𐤟𒑰-𒑴𒿱𒿲'＇‘-‛׳‹›"＂“-‟⹂〝-〟״«»(（﹙⁽₍︵)）﹚⁾₎︶\[［﹇\]］﹈\{｛﹛︷\}｝﹜︸༺-༽᚛᚜⁅⁆⌈-⌋⧼⧽⦃-⦅｟⦆｠⦇-⦘⟅⟆⟦-⟯❨-❵⸂-⸅⸉⸊⸌⸍⸜⸝⸠-⸩⹕-⹜〈〈︿〉〉﹀《︽》︾「﹁｢」﹂｣『﹃』﹄【︻】︼〔﹝︹〕﹞︺〖︗〗︘〘-〛﴾﴿‖⸾⧘-⧛§⸹¶⁋⹍⸿@＠﹫*＊﹡⁎⁑٭꙳/／\\＼﹨⹊\&＆﹠⁊⹒#＃﹟%％﹪٪‰؉‱؊†‡⸶-⸸⹋•‣‧⁃⁌⁍′-‴⁗‵-‷〃‸※‿⁔⁀⁐⁁⁂⸀⸁⸆-⸈⸋⸎-⸖⸚⸛⸞⸟⹄-⹈꙾՚՛՟־׀׃׆܊-܍࡞᠀𑙠-𑙬॰꣸-꣺꣼𑬀-𑬉৽੶૰౷಄෴๏๚๛꫞꫟༄-༊࿐࿑་-༒྅࿒-࿔࿙࿚𑨿-𑩆𑪚-𑪜𑪞-𑪢𑱰𑱱᰽-᰿၌-၏៘-៚᪠-᪦᪬᪭᳀-᳇⵰꡴꡵᯼-᯿꤮꧞꧟꩜𐕯𑁉-𑁍𐩐-𐩕𐩘𑱃-𑱅𐬹𐩿𐫰-𐫶𐮙-𐮜𑂻𑂼𑅴𑅵𑇍𑇇𑇛𑇝𑈺-𑈽𑑍𑑚𑑎𑑏𑑛𑑝𑓆𑗁𑗄-𑗗𑙃𑚹𑠻𑥅𑧢𑿿𖬷-𖬻𖭄𖺙𖺚𝪇-𝪋؈𞻰𞻱℘⅁-⅄←￩↚→￫↛↑￪↓￬↠↣↦⇒⇏⇔⇎⇴-∂𝛛𝜕𝝏𝞉𝟃∃-∇𝛁𝛻𝜵𝝯𝞩∈-∍϶∎-∑⅀+＋﬩﹢⁺₊±÷×<＜﹤≮=＝﹦⁼₌≠⩵⩶>＞﹥≯¬￢|｜~～−⁻₋⁒∓-∕⁄∖-∛؆∜؇∝-∭⨌∮-∼≁∽-≀≂-≅≇≆≈-≍≭≎-≟≡-≤≰≥≱≦-≬≲≴≳≵≶≸≷≹≺⊀≻⊁≼⋠≽⋡≾≿⊂⊄⊃⊅⊆⊈⊇⊉-⊑⋢⊒⋣⊓-⊢⊬⊣-⊨⊭⊩⊮⊪⊫⊯-⊲⋪⊳⋫⊴⋬⊵⋭⊶-⊼⅋⊽-⋟⋤-⋩⋮-⋿⌠⌡⍼⎛-⎳⏜-⏡▷◁◸-◺◿⟀-⟄⟇-⟥⟰-⟿⤀-⤳⤶-⦂⦙-⧗⧜-⧻⧾-⨋⨍-⩳⩷-⫛⫝⫝̸⫞-⫿⬰-⭄⭇-⭌♯↔↮⤴⤵‼⁉〰〽◼◻◾◽]`.split(""));

const CHAR_GROUPS: Record<string, number> = {
	"0": 1,
	"０": 1,
	"1": 2,
	"１": 2,
	"2": 3,
	"２": 3,
	"3": 4,
	"３": 4,
	"4": 5,
	"４": 5,
	"5": 6,
	"５": 6,
	"6": 7,
	"６": 7,
	"7": 8,
	"７": 8,
	"8": 9,
	"８": 9,
	"9": 10,
	"９": 10,
	"a": 11,
	"ａ": 11,
	"Ａ": 11,
	"ä": 11,
	"b": 12,
	"ｂ": 12,
	"Ｂ": 12,
	"c": 13,
	"ｃ": 13,
	"Ｃ": 13,
	"d": 14,
	"ｄ": 14,
	"Ｄ": 14,
	"e": 15,
	"ｅ": 15,
	"Ｅ": 15,
	"f": 16,
	"ｆ": 16,
	"Ｆ": 16,
	"g": 17,
	"ｇ": 17,
	"Ｇ": 17,
	"h": 18,
	"ｈ": 18,
	"Ｈ": 18,
	"i": 19,
	"ｉ": 19,
	"Ｉ": 19,
	"j": 20,
	"ｊ": 20,
	"Ｊ": 20,
	"k": 21,
	"ｋ": 21,
	"Ｋ": 21,
	"l": 22,
	"ｌ": 22,
	"Ｌ": 22,
	"m": 23,
	"ｍ": 23,
	"Ｍ": 23,
	"n": 24,
	"ｎ": 24,
	"Ｎ": 24,
	"o": 25,
	"ｏ": 25,
	"Ｏ": 25,
	"ö": 25,
	"õ": 25,
	"p": 26,
	"ｐ": 26,
	"Ｐ": 26,
	"q": 27,
	"ｑ": 27,
	"Ｑ": 27,
	"r": 28,
	"ｒ": 28,
	"Ｒ": 28,
	"s": 29,
	"ｓ": 29,
	"Ｓ": 29,
	"$": 29,
	"t": 30,
	"ｔ": 30,
	"Ｔ": 30,
	"u": 31,
	"ｕ": 31,
	"Ｕ": 31,
	"ü": 31,
	"v": 32,
	"ｖ": 32,
	"Ｖ": 32,
	"w": 33,
	"ｗ": 33,
	"Ｗ": 33,
	"x": 34,
	"ｘ": 34,
	"Ｘ": 34,
	"y": 35,
	"ｙ": 35,
	"Ｙ": 35,
	"z": 36,
	"ｚ": 36,
	"Ｚ": 36
}

const GROUP_CHARS = Object.entries(CHAR_GROUPS)
	.reduce<Record<number, string[]>>((obj, [ char, group ]) => {
		if (!(group in obj)) obj[group] = [];
		obj[group].push(char);
		return obj;
	}, {});

function getAlternateChars(char: string): string[] {
	const group = CHAR_GROUPS[char];
	if (!group) return [ char ];
	return GROUP_CHARS[group] ?? [ char ];
}

export function makeFuzzyRegex(value: string): RegExp {
	// Not good but did not want to modify the haystack, kinda genius actually.
	value = value
		.replace(/[\s・]+/g, "")
		.split("")
		.map((char) => PUNCTUATION_CHARS.has(char) ? "" : `[${getAlternateChars(char).join("")}]`)
		.join("[\\s\\p{Pc}\\p{Pd}\\p{Pe}\\p{Pf}\\p{Pi}\\p{Po}\\p{Ps}\\p{Sm}]{0,4}");

	return new RegExp(`(?<!<span class="ame__mark--inner">)${value}`, "gui");
}

export function markPattern(el: Element, pattern: RegExp) {
	el.innerHTML = el.innerHTML
		.replaceAll(pattern, (match) => {
			const markInnerEl = document.createElement("span");
			markInnerEl.classList.add("ame__mark--inner");
			markInnerEl.innerText = match;
			const markEl = document.createElement("span");
			markEl.classList.add("ame__mark");
			markEl.appendChild(markInnerEl);
			return markEl.outerHTML;
		});
}

export function markChange<T extends HTMLInputElement | HTMLTextAreaElement>(el: T): T {
	const oldValue = el.value;
	el.addEventListener("input", () => {
		if (el.value !== oldValue) el.style.backgroundColor = "yellow";
	});
	return el;
}

export function setReactInputValue(el: HTMLInputElement | HTMLSelectElement, value: string) {
	if (el instanceof HTMLInputElement) {
		Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!.call(el, value);
		el.dispatchEvent(new Event("input", { bubbles: true }));
		el.dispatchEvent(new Event("focusout", { bubbles: true }));
		return;
	}
	if (el instanceof HTMLSelectElement) {
		Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, "value")!.set!.call(el, value);
		el.dispatchEvent(new Event("change", { bubbles: true }));
		el.dispatchEvent(new Event("focusout", { bubbles: true }));
		return;
	}
}

export function beep(duration: number, frequency: number) {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    gainNode.gain.value = .25;
    oscillator.frequency.value = frequency;

    oscillator.start(audioCtx.currentTime);
    oscillator.stop(audioCtx.currentTime + (duration / 1000));
};
