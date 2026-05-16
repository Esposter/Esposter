import { readFile, writeFile } from "node:fs/promises";

const indexPath = "src/index.ts";
const source = await readFile(indexPath, "utf8");
const fixedSource = source.replaceAll(/from "(\.\/[^"]+)(?<!\.ts)";/gu, 'from "$1.ts";');

await writeFile(indexPath, fixedSource);
