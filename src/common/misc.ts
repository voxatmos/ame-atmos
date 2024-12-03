export function readCookies(): Record<string, string> {
	return Object.fromEntries(document.cookie.split("; ").map(cookie => cookie.split("=", 2)));
}

export function sleep(delay: number): Promise<void> {
	return new Promise<void>(resolve => {
		setTimeout(resolve, delay);
	});
}

export function downloadFile(data: Blob, filename: string): void {
	const url = URL.createObjectURL(data);
	const el = document.createElement("a");
	el.style.display = "none";
	el.download = filename;
	el.href = url;
	document.body.appendChild(el);
	el.click();
	URL.revokeObjectURL(url);
}

export function waitForVariable<T>(accessor: () => T): Promise<T> {
	return new Promise((resolve) => {
		const dispose = setInterval(() => {
			const value = accessor();
			if (value == null) return;
			clearInterval(dispose);
			resolve(value);
		}, 100);
	});
}
