import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// `node formatComponent.ts <tools root> <path>` — a component's staged copy, read from stdin and written to stdout as
// `vize fmt` writes it, since vize's command line reads no stdin. Vize and its configuration are the tools root's, as
// Oxfmt's are, and the configuration is named rather than discovered, since the nearest one to a component in an app
// Is that app's Vitest config, which holds no formatter options. A component that does not parse rejects with vize's
// Message, and the hook stops on it
const [toolsRoot = "", path = ""] = process.argv.slice(2);
const require = createRequire(join(toolsRoot, "package.json"));
const vizeUrl = pathToFileURL(require.resolve("vize")).href;
const { format }: typeof import("vize") = await import(vizeUrl);
const { code } = await format(readFileSync(0, "utf8"), { config: join(toolsRoot, "vite.config.ts"), filename: path });
process.stdout.write(code);
