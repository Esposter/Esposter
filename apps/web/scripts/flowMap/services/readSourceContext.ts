import type { FlowMapSourceContext } from "@@/scripts/flowMap/models/FlowMapSourceContext";

import {
  AUTO_IMPORT_PATTERN,
  COMPONENTS_DIRECTORY,
  EXPORT_NAME_REGEX,
  LAYOUT_PATTERN,
  MIDDLEWARE_EXTENSION_REGEX,
  MIDDLEWARE_PATTERN,
  NON_SOURCE_PATTERNS,
  WEB_DIRECTORY,
} from "@@/scripts/flowMap/constants";
import { getComponentKey } from "@@/scripts/flowMap/services/getComponentKey";
import { globSync, readFileSync } from "node:fs";
import { basename, resolve } from "node:path";

const readSourcePaths = (pattern: string) =>
  globSync(pattern, { cwd: WEB_DIRECTORY, exclude: NON_SOURCE_PATTERNS }).map((relativePath) =>
    resolve(WEB_DIRECTORY, relativePath),
  );

export const readSourceContext = (): FlowMapSourceContext => ({
  autoImportPathMap: new Map(
    readSourcePaths(AUTO_IMPORT_PATTERN).flatMap((path) =>
      Array.from(
        readFileSync(path, "utf8").matchAll(EXPORT_NAME_REGEX),
        ({ groups }) => [groups?.name ?? "", path] as const,
      ),
    ),
  ),
  componentPathMap: new Map(
    globSync("**/*.vue", { cwd: resolve(WEB_DIRECTORY, COMPONENTS_DIRECTORY) }).map((relativePath) => [
      getComponentKey(relativePath),
      resolve(WEB_DIRECTORY, COMPONENTS_DIRECTORY, relativePath),
    ]),
  ),
  layoutPathMap: new Map(readSourcePaths(LAYOUT_PATTERN).map((path) => [basename(path, ".vue"), path])),
  middlewarePathMap: new Map(
    readSourcePaths(MIDDLEWARE_PATTERN).map((path) => [basename(path).replace(MIDDLEWARE_EXTENSION_REGEX, ""), path]),
  ),
});
