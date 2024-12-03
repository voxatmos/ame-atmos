export function formatPath(value: string): string {
	return value
		.trim()
		.replace(/[\/\?<>\\:\*\|":]/g, "_")
		.replace(/\.+$/, "_");
}

export function parseDuration(value: string): number {
	const [ hours, minutes ] = value.split(":").map(Number);
	return (hours * 60 + minutes);
}
