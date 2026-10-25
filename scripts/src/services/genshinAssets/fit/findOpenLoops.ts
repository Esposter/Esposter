import type { SkeletonNode } from "#src/models/genshinAssets/fit/SkeletonNode";
import type { Vector } from "#src/models/shared/Vector";

import { toCrossSection } from "#src/services/genshinAssets/fit/toCrossSection";
import { toEdgeKey } from "#src/services/genshinAssets/fit/toEdgeKey";
import { toFaceEdges } from "#src/services/genshinAssets/fit/toFaceEdges";

// A piece's open loops, the edges only one of its triangles holds joined where they share a corner, each as its
// Vertices in the order its edges first name them, its edges, and its centroid and mean radius
export const findOpenLoops = (
  vertices: readonly Vector[],
  pieceFaces: readonly Vector[],
): (Pick<SkeletonNode, "centre" | "radius"> & { edges: [number, number][]; vertices: number[] })[] => {
  const edgeFaceCountMap = new Map<string, number>();
  const edgeVerticesMap = new Map<string, [number, number]>();
  for (const [first, second] of toFaceEdges(pieceFaces)) {
    const key = toEdgeKey(first, second);
    edgeFaceCountMap.set(key, (edgeFaceCountMap.get(key) ?? 0) + 1);
    if (!edgeVerticesMap.has(key)) edgeVerticesMap.set(key, [first, second]);
  }
  const openEdges = [...edgeFaceCountMap].flatMap(([key, faceCount]) => {
    const edge = edgeVerticesMap.get(key);
    return faceCount === 1 && edge ? [edge] : [];
  });
  const loopParentMap = new Map<number, number>();
  const findLoop = (vertex: number): number => {
    let loop = vertex;
    while ((loopParentMap.get(loop) ?? loop) !== loop) loop = loopParentMap.get(loop) ?? loop;
    return loop;
  };
  for (const [first, second] of openEdges) {
    if (!loopParentMap.has(first)) loopParentMap.set(first, first);
    if (!loopParentMap.has(second)) loopParentMap.set(second, second);
    loopParentMap.set(findLoop(second), findLoop(first));
  }
  const loopMap = new Map<number, { edges: [number, number][]; vertices: number[] }>();
  const seenVertices = new Set<number>();
  for (const edge of openEdges) {
    const loopKey = findLoop(edge[0]);
    const loop = loopMap.get(loopKey) ?? { edges: [], vertices: [] };
    loop.edges.push(edge);
    for (const vertex of edge) {
      if (seenVertices.has(vertex)) continue;
      seenVertices.add(vertex);
      loop.vertices.push(vertex);
    }
    loopMap.set(loopKey, loop);
  }
  return Array.from(loopMap.values(), ({ edges, vertices: loopVertices }) => {
    const { centre, radius } = toCrossSection(loopVertices.map((vertex) => vertices[vertex] ?? [0, 0, 0]));
    return { centre, edges, radius, vertices: loopVertices };
  });
};
