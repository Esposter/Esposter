// A leaf card's two triangles share an edge, so the triangles grouped by shared edges are the cards, each one's
// Triangles in the order the mesh draws them
export const computeCardOf = (indices: ArrayLike<number>, triangleCount: number): number[] => {
  const parents = Array.from({ length: triangleCount }, (_triangle, triangle) => triangle);
  const find = (triangle: number): number => {
    let root = triangle;
    while (parents[root] !== root) root = parents[root] ?? root;
    parents[triangle] = root;
    return root;
  };
  const edgeOwner = new Map<string, number>();
  for (let triangle = 0; triangle < triangleCount; triangle++) {
    const corners: [number, number, number] = [
      indices[triangle * 3] ?? 0,
      indices[triangle * 3 + 1] ?? 0,
      indices[triangle * 3 + 2] ?? 0,
    ];
    for (const [first, second] of [
      [corners[0], corners[1]],
      [corners[1], corners[2]],
      [corners[2], corners[0]],
    ] as const) {
      const edge = first < second ? `${first}-${second}` : `${second}-${first}`;
      const owner = edgeOwner.get(edge);
      if (owner === undefined) edgeOwner.set(edge, triangle);
      else parents[find(triangle)] = find(owner);
    }
  }
  return Array.from({ length: triangleCount }, (_triangle, triangle) => find(triangle));
};
