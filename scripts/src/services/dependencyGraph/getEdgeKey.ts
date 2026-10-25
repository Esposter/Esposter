import type { WorkspaceEdge } from "#src/models/dependencyGraph/WorkspaceEdge";

export const getEdgeKey = ({ from, to }: WorkspaceEdge): string => `${from}/${to}`;
