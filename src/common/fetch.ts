const cache = new Map<string, Response>();

export function fetchCors(url: string, init?: RequestInit): Promise<Response> {
	return new Promise<Response>((resolve, reject) => {
		const cachedRes = cache.get(url);
		if (cachedRes) {
			resolve(cachedRes.clone());
			return;
		}

		GM.xmlHttpRequest({
			url,
			method: init?.method ?? ("GET" as any),
			headers: Object.fromEntries(new Headers(init?.headers)),
			responseType: "blob",
			onload(res) {
				if ((res.status < 200 || res.status > 299) && res.status !== 404) {
					reject(new Error(`Fetching "${url}" responded with an erroneous status code.`));
					return;
				}

				const headers = res.responseHeaders
					.split("\r\n")
					.slice(0, -1)
					.map(line => line.split(": "));

				const fetchRes = new Response(res.response, {
					headers: Object.fromEntries(headers),
					status: res.status,
					statusText: res.statusText
				});

				Object.defineProperty(fetchRes, "url", { value: url });

				cache.set(url, fetchRes.clone());
				resolve(fetchRes);
			},
			onerror() {
				reject(new Error("Network request errored."));
			},
			ontimeout() {
				reject(new Error("Network request timed out."));
			}
		});
	});
}
