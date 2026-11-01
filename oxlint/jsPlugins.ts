import { readdirSync } from "node:fs";

const PLUGINS_DIRECTORY = new URL("../scripts/src/oxlint/", import.meta.url);
const PLUGIN_EXTENSION = ".ts";
const SUITE_EXTENSION = ".test.ts";

// A plugin is found by its file, so a new one needs no entry here: every entrypoint in the folder is loaded, and its
// Fixture suite beside it is not. The match is case-sensitive, and the result is sorted with `localeCompare`
export const JS_PLUGINS = readdirSync(PLUGINS_DIRECTORY)
  .filter((fileName) => fileName.endsWith(PLUGIN_EXTENSION) && !fileName.endsWith(SUITE_EXTENSION))
  .map((fileName) => `./scripts/src/oxlint/${fileName}`)
  .toSorted((first, second) => first.localeCompare(second));
