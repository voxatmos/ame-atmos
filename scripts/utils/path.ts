import { join } from "path";
import { readdir } from "fs/promises";

// Walks a directory tree starting from path.
export async function* walk(path: string): AsyncGenerator<string> {
	for (const entry of await readdir(path, { withFileTypes: true })) {
		if (entry.isDirectory()) {
			yield* walk(join(path, entry.name));
		} else {
			yield join(path, entry.name);
		}
	}
}
