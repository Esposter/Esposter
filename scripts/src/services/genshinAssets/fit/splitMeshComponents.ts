import type { Vector } from "#src/models/shared/Vector";

import { joinMeshVertices } from "#src/services/genshinAssets/fit/joinMeshVertices";

// A mesh's triangles grouped into the pieces they join into, two triangles one piece where they share a corner, its
// Corners joined by where they stand. Returns each piece's triangles by their index among the faces, the pieces in the
// Order their first triangle comes
export const splitMeshComponents = (vertices: readonly Vector[], faces: readonly Vector[]): number[][] => {
  const joined = joinMeshVertices(vertices);
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
