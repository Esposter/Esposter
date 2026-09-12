import type { WorkspaceEdge } from "#src/models/dependencyGraph/WorkspaceEdge";

export interface WorkspaceEdges {
  development: WorkspaceEdge[];
  runtime: WorkspaceEdge[];
}
