// The middle of the gap between the edge before a child and the edge after it, or the one edge that exists at a slot's end
export const getGapPosition = (previousEdge: number | undefined, nextEdge: number | undefined) =>
  previousEdge !== undefined && nextEdge !== undefined ? (previousEdge + nextEdge) / 2 : (previousEdge ?? nextEdge);
