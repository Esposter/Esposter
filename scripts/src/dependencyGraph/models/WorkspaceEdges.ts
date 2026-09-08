import type { WorkspaceEdge } from "#src/dependencyGraph/models/WorkspaceEdge";

export interface WorkspaceEdges {
  development: WorkspaceEdge[];
  runtime: WorkspaceEdge[];
}
