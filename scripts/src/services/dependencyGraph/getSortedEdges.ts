import type { WorkspaceEdge } from "#src/models/dependencyGraph/WorkspaceEdge";

// Ordered by `<` on the key rather than by `localeCompare`, so the order is UTF-16 code units rather than the
// Machine's collation. The svg this feeds is committed, and a locale-dependent order would rewrite it on someone
// Else's machine.
export const getSortedEdges = (workspaceEdges: Map<string, WorkspaceEdge>): WorkspaceEdge[] =>
  workspaceEdges
    .entries()
    .toArray()
    .toSorted(([leftKey], [rightKey]) => (leftKey < rightKey ? -1 : 1))
    .map(([, workspaceEdge]) => workspaceEdge);
