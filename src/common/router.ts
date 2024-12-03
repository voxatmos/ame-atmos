import { exposeFunction, imposedWindow, imposeFunction } from "./patch";

export type RouteCallback = () => void;

interface Route {
	pattern: RegExp;
	onCallbacks: RouteCallback[];
	offCallbacks: RouteCallback[];
}

const registeredRoutes: Record<string, Route> = {};

const imposedPushState = imposeFunction(imposedWindow.history.pushState, imposedWindow.history);
imposedWindow.history.pushState = exposeFunction(proxyPushState);

function proxyPushState(data: any, unused: string, url?: string | URL | null): void {
	imposedPushState(data, unused, url);
	onNavigate();
}

addEventListener("popstate", () => {
	onNavigate();
});

function onNavigate() {
	for (const route of Object.values(registeredRoutes)) {
		const cbs = route.pattern.test(location.pathname) ? route.onCallbacks : route.offCallbacks;
		for (const cb of cbs) cb();
	}
}

function ensureRoute(pattern: string): Route {
	const compiledPattern = new RegExp(`^/${pattern.replaceAll("/", "\\/")}$`);

	let route = registeredRoutes[pattern];
	if (route) return route;

	route = {
		pattern: compiledPattern,
		onCallbacks: [],
		offCallbacks: []
	};

	registeredRoutes[pattern] = route;
	return route;
}

export function onRoute(pattern: string, cb: RouteCallback): void {
	const route = ensureRoute(pattern);
	const match = route.pattern.test(location.pathname);
	route.onCallbacks.push(cb);
	if (match) cb();
}

export function offRoute(pattern: string, cb: RouteCallback): void {
	const route = ensureRoute(pattern);
	const match = route.pattern.test(location.pathname);
	route.offCallbacks.push(cb);
	if (!match) cb();
}
