import type { Vector } from "#src/models/shared/Vector";

// The decimals a corner's place is read to when corners are joined, a tenth of a millimetre
const JOIN_DECIMALS = 4;
// Each of a mesh's vertices as the first vertex standing where it stands. An export splits a vertex wherever its
// Texture seams, so a mesh's corners are joined by where they stand, not by their index
export const joinMeshVertices = (vertices: readonly Vector[]): number[] => {
  const placeVertexMap = new Map<string, number>();
  return vertices.map(([x, y, z], vertex) => {
    const place = `${x.toFixed(JOIN_DECIMALS)},${y.toFixed(JOIN_DECIMALS)},${z.toFixed(JOIN_DECIMALS)}`;
    const joinedVertex = placeVertexMap.get(place);
    if (joinedVertex !== undefined) return joinedVertex;
    placeVertexMap.set(place, vertex);
    return vertex;
  });
};
