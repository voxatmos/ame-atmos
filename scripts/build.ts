import { parseArgs } from "util";
import { readFile } from "fs/promises";
import { InlineConfig, build, createServer } from "vite";
import { UserScriptPlugin } from "./utils/userscript.js";
import { walk } from "./utils/path.js";

const pkg = JSON.parse(await readFile("package.json", "utf8"));

const args = parseArgs({
	options: {
		production: {
			type: "boolean",
			default: false
		}
	}
});

const server = await createServer();

if (!args.values.production) {
	await server.listen();
	server.printUrls();
}

const entries: string[] = [];
for await (const path of walk("src/")) {
	if (!path.endsWith("main.ts")) continue;
	const code = await readFile(path, { encoding: "utf8" });
	if (!code.startsWith("// ==UserScript==")) continue;
	entries.push(path.toString());
}

const configs = entries.map<InlineConfig>(entry => ({
	mode: args.values.production ? "production" : "development",
	plugins: [
		UserScriptPlugin({
			entry: entry,
			format: "umd",
			port: server.config.server.port,
			cdn: args.values.production ? pkg["config"]["cdn"] : ""
		})
	],
	build: {
		emptyOutDir: false,
		watch: args.values.production ? null : {},
		outDir: args.values.production ? "dist/" : "out/"
	}
}));

await Promise.all(configs.map(build));
if (args.values.production) await server.close();
