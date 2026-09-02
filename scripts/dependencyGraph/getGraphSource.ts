import type { WorkspaceEdge } from "#scripts/dependencyGraph/models/WorkspaceEdge";
import type { WorkspaceEdges } from "#scripts/dependencyGraph/models/WorkspaceEdges";
import type { WorkspacePackage } from "#scripts/models/WorkspacePackage";

import {
  CLUSTER_ATTRIBUTES,
  DEVELOPMENT_EDGE_ATTRIBUTES,
  GRAPH_ATTRIBUTES,
  RUNTIME_EDGE_ATTRIBUTES,
} from "#scripts/dependencyGraph/constants";
import { getLegendLabel } from "#scripts/dependencyGraph/getLegendLabel";
import { getPackageRole } from "#scripts/dependencyGraph/getPackageRole";
import { PackageRoleColorsMap } from "#scripts/dependencyGraph/PackageRoleColorsMap";
import { PACKAGES_DIRECTORY } from "#scripts/services/constants";

const getEdgeLines = (workspaceEdges: WorkspaceEdge[], attributes: string): string[] =>
  workspaceEdges.map(({ from, to }) => `  "${from}" -> "${to}" [${attributes}];`);

// A private package is drawn dashed: nothing installs it, so its edges are internal wiring rather than a
// Promise to anyone outside this repo. The role decides the colour, and it is read off the edges rather than
// Off a list, so a package that starts being depended on changes colour on the next run without anyone saying
// So.
const getNodeLine = ({ directory, manifest }: WorkspacePackage, workspaceEdges: WorkspaceEdges): string => {
  const { deepFill, paleFill, stroke } = PackageRoleColorsMap[getPackageRole(directory, workspaceEdges)];
  const style = manifest.private === true ? "filled,dashed" : "filled";
  return `    "${directory}" [fillcolor="${paleFill}:${deepFill}" color="${stroke}" style="${style}"];`;
};

export const getGraphSource = (workspacePackages: WorkspacePackage[], workspaceEdges: WorkspaceEdges): string =>
  [
    "digraph dependencies {",
    ...GRAPH_ATTRIBUTES.map((attribute) => `  ${attribute};`),
    `  label=${getLegendLabel()};`,
    // The nodes are boxed and titled by the directory they all live in. Graphviz draws a subgraph as a box only
    // When its name starts with `cluster`, and it boxes the nodes declared inside that subgraph — so the node
    // Lines are nested and the edges are not, which keeps an edge from silently deciding which box a node is in.
    `  subgraph cluster_${PACKAGES_DIRECTORY} {`,
    ...CLUSTER_ATTRIBUTES.map((attribute) => `    ${attribute};`),
    `    label="${PACKAGES_DIRECTORY}";`,
    ...workspacePackages.map((workspacePackage) => getNodeLine(workspacePackage, workspaceEdges)),
    "  }",
    ...getEdgeLines(workspaceEdges.runtime, RUNTIME_EDGE_ATTRIBUTES),
    ...getEdgeLines(workspaceEdges.development, DEVELOPMENT_EDGE_ATTRIBUTES),
    "}",
  ].join("\n");
