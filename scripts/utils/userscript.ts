import { readFile } from "fs/promises";
import { join, basename, dirname } from "path";
import { LibraryFormats, Plugin, ResolvedConfig } from "vite";

export interface UserScriptOptions {
	entry: string;
	format: LibraryFormats;
	name?: string;
	port?: number;
	cdn?: string;
}

export function UserScriptPlugin(options: UserScriptOptions): Plugin {
	let config: ResolvedConfig;

	return {
		name: "userscript",
		config() {
			const name = options.name ?? basename(dirname(options.entry));

			return {
				build: {
					lib: {
						name: name,
						formats: [options.format],
						entry: {
							[name]: options.entry
						}
					},
					rollupOptions: {
						output: {
							entryFileNames: "[name].user.js"
						}
					}
				}
			};
		},
		configResolved(resolvedConfig) {
			config = resolvedConfig;
		},
		async generateBundle(outputOptions, bundle) {
			for (const chunk of Object.values(bundle)) {
				if (chunk.type !== "chunk") continue;
				if (!chunk.isEntry) continue;
				if (!chunk.facadeModuleId) continue;

				const code = await readFile(chunk.facadeModuleId, { encoding: "utf8" });

				let header = "";
				for (const line of code.split("\n")) {
					if (!line.startsWith("//")) break;
					header += line + "\n";
				}

				let url = "";
				if (config.mode === "production") {
					if (options.cdn) url = `${options.cdn}${chunk.name}.user.js`;
				} else {
					if (options.port) url = `http://localhost:${join(options.port.toString(), config.build.outDir, chunk.name).replaceAll("\\", "/")}.user.js`;
				}

				if (url) {
					header = header.replaceAll(
						`// ==/UserScript==`,
						`// @downloadURL ${url}\n` +
						`// @updateURL ${url}\n` +
						`// ==/UserScript==`
					);
				}

				chunk.code = header + "\n" + chunk.code;
			}
		}
	};
}
