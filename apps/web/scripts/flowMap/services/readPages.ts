import type { FlowMapPage } from "@@/scripts/flowMap/models/FlowMapPage";

import { PAGE_EXTENSION_REGEX, PAGES_DIRECTORY, WEB_DIRECTORY } from "@@/scripts/flowMap/constants";
import { globSync } from "node:fs";
import { resolve } from "node:path";

// One node per page file, as Nuxt's file router names it: [id] is one segment, [[id]] an optional one, [...slug] any
export const readPages = (): FlowMapPage[] =>
  globSync("**/*.vue", { cwd: resolve(WEB_DIRECTORY, PAGES_DIRECTORY) })
    .map((relativePath) => {
      const segments = relativePath
        .replaceAll("\\", "/")
        .replace(PAGE_EXTENSION_REGEX, "")
        .split("/")
        .filter((segment, index, allSegments) => !(segment === "index" && index === allSegments.length - 1));
      const patterns = segments.map((segment) => {
        if (segment.startsWith("[[")) return "(?:/[^/]+)?";
        else if (segment.startsWith("[...")) return "(?:/.*)?";
        else if (segment.startsWith("[")) return "/[^/]+";
        else return `/${RegExp.escape(segment)}`;
      });
      return {
        catchAllCount: segments.filter((segment) => segment.startsWith("[...")).length,
        path: resolve(WEB_DIRECTORY, PAGES_DIRECTORY, relativePath),
        regex: new RegExp(`^${patterns.join("")}/?$`, "u"),
        route: `/${segments.join("/")}`,
        staticCount: segments.filter((segment) => !segment.startsWith("[")).length,
      };
    })
    .toSorted((a, b) => (a.route > b.route ? 1 : -1));
