import { beep } from "./utils"

export enum MessageType {
	Work = "work"
}

interface MessageValues {
	[MessageType.Work]: Work
}

interface MessageContainer<T> {
	value: T
	timestamp: number
}

interface Work {
	name: string | null
	iswc: string | null
	codes: {
		external: boolean
		jasrac: string | null
		nextone: string | null
	}
	lyricists: string[]
	composers: string[]
	arrangers: string[]
	publishers: string[]
	sources: string[]
	context: {
		tokens: string[]
	}
}

export function pushBusValue<T extends keyof MessageValues>(type: T, value: MessageValues[T] | null, notify = true) {
	if (document.visibilityState !== "visible") return;
	if (notify) beep(50, 1000);
	if (value == null) return GM.deleteValue(type);
	console.info("setBusValue", type, value);
	return GM.setValue(type, {
		value,
		timestamp: new Date().getTime() + 60 * 1000
	});
}

export async function pullBusValue<T extends keyof MessageValues>(type: T): Promise<MessageValues[T] | null> {
	if (document.visibilityState !== "visible") return null;
	const container = await GM.getValue<MessageContainer<MessageValues[T]>>(type);
	if (!container) return null;
	await pushBusValue(type, null, false);
	if (container.timestamp < new Date().getTime()) return null;
	console.info("getBusValue", type, container);
	return container.value;
}

export async function updateBusValue<T extends keyof MessageValues>(type: T, cb: (value: MessageValues[T]) => void): Promise<void> {
	const value = await pullBusValue(type);
	if (!value) return;

	try {
		await cb(value);
	} catch (err) {
		console.error(err);
	} finally {
		await pushBusValue(type, value);
	}
}
