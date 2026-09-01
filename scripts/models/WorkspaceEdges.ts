import type { WorkspaceEdge } from "#scripts/models/WorkspaceEdge";

export interface WorkspaceEdges {
  development: WorkspaceEdge[];
  runtime: WorkspaceEdge[];
}
