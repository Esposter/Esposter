import { readdirSync } from "node:fs";

const PLUGINS_DIRECTORY = new URL("../scripts/src/oxlint/", import.meta.url);
const PLUGIN_EXTENSION = ".ts";
const SUITE_EXTENSION = ".test.ts";

// An ESLint plugin whose rules read only a script's syntax loads as it is, so it joins here by package name and
// Needs no copy of its own. A rule that listens on a template's nodes cannot, because oxlint hands a plugin no template
const THIRD_PARTY_PLUGINS = ["eslint-plugin-pinia"];

// A plugin is found by its file, so a new one needs no entry here: every entrypoint in the folder is loaded, and its
// Fixture suite beside it is not. The match is case-sensitive, and the result is sorted with `localeCompare`
export const JS_PLUGINS: string[] = [
  ...readdirSync(PLUGINS_DIRECTORY)
    .filter((fileName) => fileName.endsWith(PLUGIN_EXTENSION) && !fileName.endsWith(SUITE_EXTENSION))
    .map((fileName) => `./scripts/src/oxlint/${fileName}`)
    .toSorted((firstPath, secondPath) => firstPath.localeCompare(secondPath)),
  ...THIRD_PARTY_PLUGINS,
];
