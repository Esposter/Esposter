import type { WorkspaceEdge } from "#src/models/dependencyGraph/WorkspaceEdge";
import type { WorkspaceEdges } from "#src/models/dependencyGraph/WorkspaceEdges";
import type { WorkspacePackage } from "#src/models/shared/WorkspacePackage";

import {
  CLUSTER_ATTRIBUTES,
  DEVELOPMENT_EDGE_ATTRIBUTES,
  GRAPH_ATTRIBUTES,
  RUNTIME_EDGE_ATTRIBUTES,
} from "#src/services/dependencyGraph/constants";
import { getLegendLabel } from "#src/services/dependencyGraph/getLegendLabel";
import { getPackageRole } from "#src/services/dependencyGraph/getPackageRole";
import { PackageRoleColorsMap } from "#src/services/dependencyGraph/PackageRoleColorsMap";

const getEdgeLines = (workspaceEdges: WorkspaceEdge[], attributes: string): string[] =>
  workspaceEdges.map(({ from, to }) => `  "${from}" -> "${to}" [${attributes}];`);

// In the order the members come in, which `getWorkspacePackages` sorts by path — so the clusters are drawn
// In the same order however the workspace file happens to list its globs.
const getWorkspaceDirectories = (workspacePackages: WorkspacePackage[]): string[] => [
  ...new Set(
    workspacePackages.flatMap(({ workspaceDirectory }) => (workspaceDirectory === "" ? [] : [workspaceDirectory])),
  ),
];

// The nodes are boxed and titled by the workspace root they live under. Graphviz draws a subgraph as a box only
// When its name starts with `cluster`, and it boxes the nodes declared inside that subgraph — so the node lines
// Are nested and the edges are not, which keeps an edge from silently deciding which box a node is in.
const getClusterLines = (
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

// A private package is drawn dashed: nothing installs it, so its edges are internal wiring rather than a
// Promise to anyone outside this repo. The role decides the colour, and it is read off the edges rather than
// Off a list, so a package that starts being depended on changes colour on the next run without anyone saying
// So.
const getNodeLine = ({ directory, manifest }: WorkspacePackage, workspaceEdges: WorkspaceEdges): string => {
  const { deepFill, paleFill, stroke } = PackageRoleColorsMap[getPackageRole(directory, workspaceEdges)];
  const style = manifest.private === true ? "filled,dashed" : "filled";
  return `"${directory}" [fillcolor="${paleFill}:${deepFill}" color="${stroke}" style="${style}"];`;
};

export const getGraphSource = (workspacePackages: WorkspacePackage[], workspaceEdges: WorkspaceEdges): string =>
  [
    "digraph dependencies {",
    ...GRAPH_ATTRIBUTES.map((attribute) => `  ${attribute};`),
    `  label=${getLegendLabel()};`,
    // One cluster per workspace directory, read off the members themselves so a cluster is a directory that
    // Holds members rather than a list kept in step with `pnpm-workspace.yaml` by hand.
    ...getWorkspaceDirectories(workspacePackages).flatMap((workspaceDirectory) =>
      getClusterLines(workspaceDirectory, workspacePackages, workspaceEdges),
    ),
    // A member sitting at the repository root is in no cluster: it belongs to neither of the things the repo
    // Ships, which is the whole reason it lives up there.
    ...workspacePackages
      .filter(({ workspaceDirectory }) => workspaceDirectory === "")
      .map((workspacePackage) => `  ${getNodeLine(workspacePackage, workspaceEdges)}`),
    ...getEdgeLines(workspaceEdges.runtime, RUNTIME_EDGE_ATTRIBUTES),
    ...getEdgeLines(workspaceEdges.development, DEVELOPMENT_EDGE_ATTRIBUTES),
    "}",
  ].join("\n");
