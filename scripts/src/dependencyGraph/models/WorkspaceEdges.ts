import type { WorkspaceEdge } from "#scripts/dependencyGraph/models/WorkspaceEdge";

export interface WorkspaceEdges {
  development: WorkspaceEdge[];
  runtime: WorkspaceEdge[];
}
