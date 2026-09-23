import type { FlowMapPage } from "@@/scripts/flowMap/models/FlowMapPage";
import type { FlowMapSourceNode } from "@@/scripts/flowMap/models/FlowMapSourceNode";

import {
  NODE_ID_SEPARATOR_REGEX,
  ROUTE_PARAMETER_PLACEHOLDER,
  SHELL_ENTRY_PATTERNS,
  SHELL_NODE_ID,
  WEB_DIRECTORY,
} from "@@/scripts/flowMap/constants";
import { readPages } from "@@/scripts/flowMap/services/readPages";
import { readSourceContext } from "@@/scripts/flowMap/services/readSourceContext";
import { readSourceNode } from "@@/scripts/flowMap/services/readSourceNode";
import { getOrCreate, InvalidOperationError, Operation, RoutePath } from "@esposter/shared";
import { globSync } from "node:fs";
import { resolve } from "node:path";

const getNodeId = (route: string) => `route${route.replaceAll(NODE_ID_SEPARATOR_REGEX, "_")}`;
// Where a RoutePath entry lands: the most specific page whose pattern it matches, as the router ranks them
const getRoutePathPageMap = (pages: FlowMapPage[]) =>
  new Map(
    Object.entries(RoutePath).flatMap(([key, value]) => {
      // Each entry takes its own number of parameters, so it is applied rather than called with a spread
      const url: string =
        typeof value === "function"
          ? Reflect.apply(
              value,
              undefined,
              Array.from({ length: value.length }, () => ROUTE_PARAMETER_PLACEHOLDER),
            )
          : value;
      if (!url.startsWith("/")) return [];
      const page = pages
        .filter(({ regex }) => regex.test(url))
        .toSorted((a, b) => a.catchAllCount - b.catchAllCount || b.staticCount - a.staticCount)
        .at(0);
      if (!page) throw new InvalidOperationError(Operation.Read, getRoutePathPageMap.name, `${key}: ${url}`);
      return [[key, page] as const];
    }),
  );
// The pages linked from everything reached from the entries, following each file's dependencies once and never
// Into a file already visited, which is how a page's walk stops where the shell's has been
const readTargetPages = (
  entryPaths: string[],
  readNode: (path: string) => FlowMapSourceNode,
  routePathPageMap: Map<string, FlowMapPage>,
  visitedPaths = new Set<string>(),
) => {
  const pendingPaths = [...entryPaths];
  const targetPages = new Set<FlowMapPage>();
  for (let path = pendingPaths.pop(); path !== undefined; path = pendingPaths.pop()) {
    if (visitedPaths.has(path)) continue;
    visitedPaths.add(path);
    const { dependencies, routePathKeys } = readNode(path);
    for (const key of routePathKeys) {
      const page = routePathPageMap.get(key);
      if (page) targetPages.add(page);
    }
    pendingPaths.push(...dependencies);
  }
  return { targetPages, visitedPaths };
};
// Every page as a node, an edge from a page to each page it links to, and the shell's links drawn once from one node
// Rather than from every page it frames
export const getFlowMap = () => {
  const pages = readPages();
  const context = readSourceContext();
  const nodeMap = new Map<string, FlowMapSourceNode>();
  const readNode = (path: string) => getOrCreate(nodeMap, path, () => readSourceNode(path, context));
  const routePathPageMap = getRoutePathPageMap(pages);
  const shellEntryPaths = SHELL_ENTRY_PATTERNS.flatMap((pattern) =>
    globSync(pattern, { cwd: WEB_DIRECTORY }).map((relativePath) => resolve(WEB_DIRECTORY, relativePath)),
  );
  // What every framed page reaches is the shell's, drawn once from its node rather than again from each page
  const shell = readTargetPages(shellEntryPaths, readNode, routePathPageMap);
  const toEdges = (sourceId: string, targetPages: Set<FlowMapPage>, sourcePage?: FlowMapPage) =>
    [...targetPages]
      .filter((targetPage) => targetPage !== sourcePage)
      .map(({ route }) => `  ${sourceId} --> ${getNodeId(route)}`)
      .toSorted();
  return [
    "flowchart LR",
    `  ${SHELL_NODE_ID}[["The shell"]]`,
    ...pages.map(({ route }) => `  ${getNodeId(route)}["${route}"]`),
    ...toEdges(SHELL_NODE_ID, shell.targetPages),
    ...pages.flatMap((page) =>
      toEdges(
        getNodeId(page.route),
        readTargetPages([page.path], readNode, routePathPageMap, new Set(shell.visitedPaths)).targetPages,
        page,
      ),
    ),
    "",
  ].join("\n");
};
