import type { GraphEdge } from "#shared/models/flowchartEditor/data/GraphEdge";

export type GraphEdgePatch = Partial<Pick<GraphEdge, "label" | "type">>;
// The edge the id names with the patch laid over it, and every other edge as it was
export const patchEdge = <TEdge extends Pick<GraphEdge, "id">>(
  edges: TEdge[],
  id: GraphEdge["id"],
  patch: GraphEdgePatch,
) => edges.map((edge) => (edge.id === id ? { ...edge, ...patch } : edge));
