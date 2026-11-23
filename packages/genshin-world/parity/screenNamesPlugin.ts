import type { Plugin } from "vite";

import { getComponentName } from "@esposter/configuration";
import { existsSync, readdirSync } from "node:fs";
import { basename, dirname, join } from "node:path";

// The screens on the parity page are named in Node, where the configuration package's root loads, and handed to the
// Page as a Virtual module: the page itself cannot import that root, which reaches Node's file system. A screen is the
// `Index.vue` beside Each `Index.fixture.ts`, keyed by its path under `/src/components` and named the way the
// Components barrel names every Component (`getComponentName`), so a lazy or unreferenced directory is named too
const VIRTUAL_ID = "virtual:parity-screen-names";
const RESOLVED_ID = `\0${VIRTUAL_ID}`;
const COMPONENT_FILE_NAME = "Index.vue";
const COMPONENTS_DIRECTORY = join(import.meta.dirname, "../src/components");
const FIXTURE_FILE_NAME = "Index.fixture.ts";

const readComponentNames = (): Record<string, string> =>
  Object.fromEntries(
    readdirSync(COMPONENTS_DIRECTORY, { recursive: true })
      .map(String)
      .filter((path) => basename(path) === FIXTURE_FILE_NAME)
      .map((path) => dirname(path).replaceAll("\\", "/"))
      .filter((directory) => existsSync(join(COMPONENTS_DIRECTORY, directory, COMPONENT_FILE_NAME)))
      .map((directory) => [
        `/src/components/${directory}/${COMPONENT_FILE_NAME}`,
        getComponentName(`${directory}/${COMPONENT_FILE_NAME}`),
      ]),
  );

export const screenNamesPlugin: Plugin = {
  load: (id) =>
    id === RESOLVED_ID ? `export const componentNames = ${JSON.stringify(readComponentNames())};` : undefined,
  name: "parity-screen-names",
  resolveId: (id) => (id === VIRTUAL_ID ? RESOLVED_ID : undefined),
};
