import type { Vector } from "#src/models/shared/Vector";

// The decimals a corner's place is read to when corners are joined, a tenth of a millimetre
const JOIN_DECIMALS = 4;
// A mesh's triangles grouped into the pieces they join into, two triangles one piece where they share a corner. An
// Export splits a vertex wherever its texture seams, so corners are joined by where they stand, not by their index.
// Returns each piece's triangles by their index among the faces, the pieces in the order their first triangle comes
export const splitMeshComponents = (vertices: readonly Vector[], faces: readonly Vector[]): number[][] => {
  const placeVertexMap = new Map<string, number>();
  const joined = vertices.map(([x, y, z], vertex) => {
    const place = `${x.toFixed(JOIN_DECIMALS)},${y.toFixed(JOIN_DECIMALS)},${z.toFixed(JOIN_DECIMALS)}`;
    const joinedVertex = placeVertexMap.get(place);
    if (joinedVertex !== undefined) return joinedVertex;
    placeVertexMap.set(place, vertex);
    return vertex;
  });
  const parents = Int32Array.from(vertices, (_vertex, vertex) => vertex);
  const findRoot = (vertex: number): number => {
    let root = vertex;
    while ((parents[root] ?? root) !== root) root = parents[root] ?? root;
    let current = vertex;
    while (current !== root) {
      const parent = parents[current] ?? root;
      parents[current] = root;
      current = parent;
    }
    return root;
  };
  for (const [first, second, third] of faces) {
    const root = findRoot(joined[first] ?? first);
    parents[findRoot(joined[second] ?? second)] = root;
    parents[findRoot(joined[third] ?? third)] = root;
  }
  const rootFacesMap = new Map<number, number[]>();
  for (const [index, face] of faces.entries()) {
    const root = findRoot(joined[face[0]] ?? face[0]);
    const pieceFaces = rootFacesMap.get(root) ?? [];
    pieceFaces.push(index);
    rootFacesMap.set(root, pieceFaces);
  }
  return [...rootFacesMap.values()];
};
