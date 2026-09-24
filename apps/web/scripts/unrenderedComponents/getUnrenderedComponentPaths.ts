import { COMPONENTS_DIRECTORY, NON_SOURCE_PATTERNS, WEB_DIRECTORY } from "@@/scripts/flowMap/constants";
import { readSourceContext } from "@@/scripts/flowMap/services/readSourceContext";
import { readSourceNode } from "@@/scripts/flowMap/services/readSourceNode";
import { globSync } from "node:fs";
import { relative, resolve } from "node:path";

// Nuxt Content renders these from markdown by element name, which no template or import names
const CONTENT_COMPONENTS_DIRECTORY = `${COMPONENTS_DIRECTORY}/content/`;
// Every component nothing renders: no template names its tag by the auto-import name the flow map resolves, lazy or
// Not, and no source imports its file. A test holds the list empty, so a component whose last consumer went is
// Deleted with it rather than left for knip, which sees an auto-imported component as used by being a component
export const getUnrenderedComponentPaths = () => {
  const context = readSourceContext();
  const renderedPaths = new Set(
    globSync("{app,shared}/**/*.{ts,vue}", { cwd: WEB_DIRECTORY, exclude: NON_SOURCE_PATTERNS }).flatMap(
      (relativePath) => readSourceNode(resolve(WEB_DIRECTORY, relativePath), context).dependencies,
    ),
  );
  return context.componentPathMap
    .values()
    .filter((path) => !renderedPaths.has(path))
    .map((path) => relative(WEB_DIRECTORY, path).replaceAll("\\", "/"))
    .filter((path) => !path.startsWith(CONTENT_COMPONENTS_DIRECTORY))
    .toArray()
    .toSorted();
};
