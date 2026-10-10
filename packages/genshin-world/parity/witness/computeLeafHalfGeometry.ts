import { BufferAttribute, BufferGeometry } from "three";

// A leaf card's two triangles share an edge, so the triangles grouped by shared edges are the cards, each one's
// Triangles in the order the mesh draws them
const computeCardOf = (indices: ArrayLike<number>, triangleCount: number): number[] => {
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
// The leaf geometry's triangles of one half of its cards: the cards in order of their first triangle, the even ones
// For half 0 and the odd ones for half 1, so each half is half the cards and the two are disjoint
const halfGeometryMap = new WeakMap<BufferGeometry, [BufferGeometry?, BufferGeometry?]>();
export const computeLeafHalfGeometry = (geometry: BufferGeometry, half: 0 | 1): BufferGeometry => {
  const cached = halfGeometryMap.get(geometry) ?? [];
  halfGeometryMap.set(geometry, cached);
  const cachedHalf = cached[half];
  if (cachedHalf) return cachedHalf;
  const index = geometry.getIndex();
  const indices = index
    ? index.array
    : Array.from({ length: (geometry.getAttribute("position").count / 3) * 3 }, (_position, vertex) => vertex);
  const triangleCount = indices.length / 3;
  const cardOf = computeCardOf(indices, triangleCount);
  const cardRank = new Map<number, number>();
  for (const card of cardOf) if (!cardRank.has(card)) cardRank.set(card, cardRank.size);
  const kept: number[] = [];
  for (let triangle = 0; triangle < triangleCount; triangle++)
    if ((cardRank.get(cardOf[triangle] ?? 0) ?? 0) % 2 === half)
      kept.push(indices[triangle * 3] ?? 0, indices[triangle * 3 + 1] ?? 0, indices[triangle * 3 + 2] ?? 0);
  const halfGeometry = new BufferGeometry();
  for (const name of Object.keys(geometry.attributes)) halfGeometry.setAttribute(name, geometry.getAttribute(name));
  halfGeometry.setIndex(new BufferAttribute(new Uint32Array(kept), 1));
  cached[half] = halfGeometry;
  return halfGeometry;
};
