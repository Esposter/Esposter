import type { WorkspaceEdges } from "#src/models/dependencyGraph/WorkspaceEdges";
import type { WorkspacePackage } from "#src/models/shared/WorkspacePackage";

import { CLUSTER_ATTRIBUTES } from "#src/services/dependencyGraph/constants";
import { getNodeLine } from "#src/services/dependencyGraph/getNodeLine";

// The nodes are boxed and titled by the workspace root they live under. Graphviz draws a subgraph as a box only
// When its name starts with `cluster`, and it boxes the nodes declared inside that subgraph — so the node lines
// Are nested and the edges are not, which keeps an edge from silently deciding which box a node is in.
export const getClusterLines = (
  workspaceDirectory: string,
  workspacePackages: WorkspacePackage[],
  workspaceEdges: WorkspaceEdges,
): string[] => [
  `  subgraph cluster_${workspaceDirectory} {`,
  ...CLUSTER_ATTRIBUTES.map((attribute) => `    ${attribute};`),
  `    label="${workspaceDirectory}";`,
  ...workspacePackages
    .filter((workspacePackage) => workspacePackage.workspaceDirectory === workspaceDirectory)
    .map((workspacePackage) => `    ${getNodeLine(workspacePackage, workspaceEdges)}`),
  "  }",
];
