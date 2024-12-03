declare global {

	interface Window {
		wrappedJSObject: Window | undefined;
		Promise: typeof Promise;
	}

	const unsafeWindow: Window;

	const cloneInto: CloneIntoFunction<object> | undefined;
	const exportFunction: ExportFunctionFunction<Function> | undefined;

}

interface CloneIntoOptions {
	cloneFunctions?: boolean;
	wrapReflectors?: boolean;
}

interface ExportFunctionOptions {
	defineAs?: string;
	allowCrossOriginArguments?: boolean;
}

type CloneIntoFunction<T extends object> = (obj: T, targetScope: object, options?: CloneIntoOptions) => T;
type ExportFunctionFunction<T extends Function> = (fn: T, targetScope: object, options?: ExportFunctionOptions) => T;

export const imposedWindow = unsafeWindow?.wrappedJSObject ?? unsafeWindow;

const cloneIntoImpl: CloneIntoFunction<any> = typeof cloneInto === "function" ? cloneInto : (obj: object) => obj;
const exportFunctionImpl: ExportFunctionFunction<any> = typeof exportFunction === "function" ? exportFunction : (fn: Function) => fn;

export function exposeObject<T extends object>(obj: T): T {
	return cloneIntoImpl(obj, imposedWindow, {
		cloneFunctions: true,
		wrapReflectors: true
	});
}

export function exposeFunction<T extends Function>(fn: T): T {
	return exportFunctionImpl(fn, imposedWindow);
}

export function exposeAsyncFunction<T extends (...args: any[]) => Promise<any>>(fn: T): T {
	return exportFunctionImpl(wrapAsyncFunction(fn), imposedWindow);
}

export function imposeFunction<T extends (...args: Parameters<T>) => any>(fn: T, target?: object) {
	target ??= imposedWindow;

	return function (...args: Parameters<T>): ReturnType<T> {
		return fn.call(target, ...exposeObject(args));
	};
}

function wrapAsyncFunction<T extends (...args: any[]) => Promise<any>>(fn: T): (args: Parameters<T>) => Promise<ReturnType<T>> {
	return (...args) => new imposedWindow.Promise(exposeFunction((resolve, reject) => {
		fn(...args)
			.then(resolve)
			.catch(reject);
	}));
}
