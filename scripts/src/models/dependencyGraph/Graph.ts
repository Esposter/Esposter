import type { WorkspaceEdges } from "#src/models/dependencyGraph/WorkspaceEdges";
import type { WorkspacePackage } from "#src/models/shared/WorkspacePackage";

export interface Graph {
  svg: string;
  workspaceEdges: WorkspaceEdges;
  workspacePackages: WorkspacePackage[];
}
