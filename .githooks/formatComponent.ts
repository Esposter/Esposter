import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

// A component's staged copy, read from stdin and written to stdout as `vize fmt` writes it, since vize's command
// Line reads no stdin. The hook names the tools root and the component in `TOOLS_ROOT` and `COMPONENT_PATH`: a helper
// Of the hook takes no arguments, and the citty that would read them is not installed where the hook runs. Vize and its
// Configuration are the tools root's, as oxfmt's are, and the configuration is named rather than discovered, since the
// Nearest one to a component in an app is that app's Vitest config, which holds no formatter options. A component that
// Does not parse rejects with vize's message, and the hook stops on it
const { COMPONENT_PATH: path = "", TOOLS_ROOT: toolsRoot = "" } = process.env;
const require = createRequire(join(toolsRoot, "package.json"));
const vizeUrl = pathToFileURL(require.resolve("vize")).href;
const { format }: typeof import("vize") = await import(vizeUrl);
const { code } = await format(readFileSync(0, "utf8"), { config: join(toolsRoot, "vite.config.ts"), filename: path });
process.stdout.write(code);
