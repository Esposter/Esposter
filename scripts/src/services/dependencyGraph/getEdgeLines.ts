import type { WorkspaceEdge } from "#src/models/dependencyGraph/WorkspaceEdge";

export const getEdgeLines = (workspaceEdges: WorkspaceEdge[], attributes: string): string[] =>
  workspaceEdges.map(({ from, to }) => `  "${from}" -> "${to}" [${attributes}];`);
