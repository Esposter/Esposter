import type { WorkspaceEdge } from "#scripts/models/WorkspaceEdge";
import type { WorkspaceEdges } from "#scripts/models/WorkspaceEdges";
import type { WorkspacePackage } from "#scripts/models/WorkspacePackage";

import {
  DEVELOPMENT_EDGE_ATTRIBUTES,
  GRAPH_ATTRIBUTES,
  RUNTIME_EDGE_ATTRIBUTES,
} from "#scripts/dependencyGraph/constants";

const getEdgeLines = (workspaceEdges: WorkspaceEdge[], attributes: string): string[] =>
  workspaceEdges.map(({ from, to }) => `  "${from}" -> "${to}" [${attributes}];`);

// A private package is drawn dashed: nothing installs it, so its edges are internal wiring rather than a
// Promise to anyone outside this repo.
const getNodeLine = ({ directory, manifest }: WorkspacePackage): string =>
  `  "${directory}"${manifest.private === true ? ' [style="filled,dashed"]' : ""};`;

export const getGraphSource = (
  workspacePackages: WorkspacePackage[],
  { development, runtime }: WorkspaceEdges,
): string =>
  [
    "digraph dependencies {",
    ...GRAPH_ATTRIBUTES.map((attribute) => `  ${attribute};`),
    ...workspacePackages.map((workspacePackage) => getNodeLine(workspacePackage)),
    ...getEdgeLines(runtime, RUNTIME_EDGE_ATTRIBUTES),
    ...getEdgeLines(development, DEVELOPMENT_EDGE_ATTRIBUTES),
    "}",
  ].join("\n");
