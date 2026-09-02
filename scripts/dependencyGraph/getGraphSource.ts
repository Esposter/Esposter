import type { WorkspaceEdge } from "#scripts/dependencyGraph/models/WorkspaceEdge";
import type { WorkspaceEdges } from "#scripts/dependencyGraph/models/WorkspaceEdges";
import type { WorkspacePackage } from "#scripts/models/WorkspacePackage";

import {
  CLUSTER_ATTRIBUTES,
  DEVELOPMENT_EDGE_ATTRIBUTES,
  GRAPH_ATTRIBUTES,
  RUNTIME_EDGE_ATTRIBUTES,
} from "#scripts/dependencyGraph/constants";
import { PACKAGES_DIRECTORY } from "#scripts/services/constants";

const getEdgeLines = (workspaceEdges: WorkspaceEdge[], attributes: string): string[] =>
  workspaceEdges.map(({ from, to }) => `  "${from}" -> "${to}" [${attributes}];`);

// A private package is drawn dashed: nothing installs it, so its edges are internal wiring rather than a
// Promise to anyone outside this repo.
const getNodeLine = ({ directory, manifest }: WorkspacePackage): string =>
  `    "${directory}"${manifest.private === true ? ' [style="filled,dashed"]' : ""};`;

export const getGraphSource = (
  workspacePackages: WorkspacePackage[],
  { development, runtime }: WorkspaceEdges,
): string =>
  [
    "digraph dependencies {",
    ...GRAPH_ATTRIBUTES.map((attribute) => `  ${attribute};`),
    // The nodes are boxed and titled by the directory they all live in. Graphviz draws a subgraph as a box only
    // When its name starts with `cluster`, and it boxes the nodes declared inside that subgraph — so the node
    // Lines are nested and the edges are not, which keeps an edge from silently deciding which box a node is in.
    `  subgraph cluster_${PACKAGES_DIRECTORY} {`,
    ...CLUSTER_ATTRIBUTES.map((attribute) => `    ${attribute};`),
    `    label="${PACKAGES_DIRECTORY}";`,
    ...workspacePackages.map((workspacePackage) => getNodeLine(workspacePackage)),
    "  }",
    ...getEdgeLines(runtime, RUNTIME_EDGE_ATTRIBUTES),
    ...getEdgeLines(development, DEVELOPMENT_EDGE_ATTRIBUTES),
    "}",
  ].join("\n");
