import type { WorkspaceEdges } from "#src/models/dependencyGraph/WorkspaceEdges";
import type { WorkspacePackage } from "#src/models/shared/WorkspacePackage";

import {
  DEVELOPMENT_EDGE_ATTRIBUTES,
  GRAPH_ATTRIBUTES,
  RUNTIME_EDGE_ATTRIBUTES,
} from "#src/services/dependencyGraph/constants";
import { getClusterLines } from "#src/services/dependencyGraph/getClusterLines";
import { getEdgeLines } from "#src/services/dependencyGraph/getEdgeLines";
import { getLegendLabel } from "#src/services/dependencyGraph/getLegendLabel";
import { getNodeLine } from "#src/services/dependencyGraph/getNodeLine";
import { getWorkspaceDirectories } from "#src/services/dependencyGraph/getWorkspaceDirectories";

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
