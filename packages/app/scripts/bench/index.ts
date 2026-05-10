import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const packageRoot = fileURLToPath(new URL("../../", import.meta.url));
const resultsPath = `${packageRoot}bench/results.json`;
const results = JSON.parse(readFileSync(resultsPath, "utf8")) as { files: { filepath: string }[] };

for (const file of results.files) file.filepath = file.filepath.replace(packageRoot, "");

writeFileSync(resultsPath, JSON.stringify(results, null, 2));
