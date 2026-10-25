import type { SkeletonNode } from "#src/models/genshinAssets/fit/SkeletonNode";
import type { Vector } from "#src/models/shared/Vector";

import { toCrossSection } from "#src/services/genshinAssets/fit/toCrossSection";
import { toDistance } from "#src/services/genshinAssets/fit/toDistance";
import { toEdgeKey } from "#src/services/genshinAssets/fit/toEdgeKey";
import { toFaceEdges } from "#src/services/genshinAssets/fit/toFaceEdges";

// One piece's skeleton: its vertices' distances along its edges from its start, cut at every step of that distance into
// The loops each level crosses the piece in, each loop a node grown from the nearest node a step nearer the start, and
// The piece's farthest vertex past each loop nothing grows from, its tip
export const traceSkeleton = (
  vertices: readonly Vector[],
  pieceFaces: readonly Vector[],
  startVertices: readonly number[],
  levelStep: number,
): SkeletonNode[] => {
  const edgeVerticesMap = new Map<string, [number, number]>();
  const neighbourMap = new Map<number, number[]>();
  for (const [first, second] of toFaceEdges(pieceFaces)) {
    const key = toEdgeKey(first, second);
    if (edgeVerticesMap.has(key)) continue;
    edgeVerticesMap.set(key, [first, second]);
    neighbourMap.set(first, [...(neighbourMap.get(first) ?? []), second]);
    neighbourMap.set(second, [...(neighbourMap.get(second) ?? []), first]);
  }
  const pieceVertices = [...neighbourMap.keys()];
  const readVertex = (vertex: number): Vector => vertices[vertex] ?? [0, 0, 0];
  // Dijkstra from every start vertex at once, along the piece's edges
  const distanceMap = new Map(pieceVertices.map((vertex) => [vertex, Infinity]));
  for (const vertex of startVertices) distanceMap.set(vertex, 0);
  const unsettled = new Set(pieceVertices);
  while (unsettled.size > 0) {
    let nearest = -1;
    for (const vertex of unsettled)
      if (nearest === -1 || (distanceMap.get(vertex) ?? 0) < (distanceMap.get(nearest) ?? 0)) nearest = vertex;
    unsettled.delete(nearest);
    const nearestDistance = distanceMap.get(nearest) ?? 0;
    for (const neighbour of neighbourMap.get(nearest) ?? []) {
      const distance = nearestDistance + toDistance(readVertex(nearest), readVertex(neighbour));
      if (distance < (distanceMap.get(neighbour) ?? 0)) distanceMap.set(neighbour, distance);
    }
  }
  const readDistance = (vertex: number): number => distanceMap.get(vertex) ?? 0;
  const nodes: SkeletonNode[] = [
    { ...toCrossSection(startVertices.map((vertex) => readVertex(vertex))), farVertices: [...startVertices], level: 0 },
  ];
  const maxDistance = Math.max(...pieceVertices.map((vertex) => readDistance(vertex)));
  let previousLevel = [0];
  for (let level = 1; level * levelStep < maxDistance; level++) {
    const cut = level * levelStep;
    const checkIsPast = (vertex: number): boolean => readDistance(vertex) >= cut;
    // Each face the level crosses joins the two edges it cuts into one loop
    const loopParents = new Map<string, string>();
    const findLoop = (key: string): string => {
      let loop = key;
      while (loopParents.get(loop) !== loop) loop = loopParents.get(loop) ?? loop;
      return loop;
    };
    for (const face of pieceFaces) {
      const cutKeys = face.flatMap((first, corner) => {
        const second = face[(corner + 1) % 3] ?? first;
        return checkIsPast(first) === checkIsPast(second) ? [] : [toEdgeKey(first, second)];
      });
      for (const key of cutKeys) if (!loopParents.has(key)) loopParents.set(key, key);
      const [firstKey, ...otherKeys] = cutKeys;
      if (firstKey) for (const key of otherKeys) loopParents.set(findLoop(key), findLoop(firstKey));
    }
    const loopKeysMap = Map.groupBy(loopParents.keys(), (key) => findLoop(key));
    const levelNodes: number[] = [];
    for (const keys of loopKeysMap.values()) {
      const edges = keys.flatMap((key) => {
        const edge = edgeVerticesMap.get(key);
        return edge ? [edge] : [];
      });
      const points = edges.map(([first, second]): Vector => {
        const share = (cut - readDistance(first)) / (readDistance(second) - readDistance(first));
        const [firstPoint, secondPoint] = [readVertex(first), readVertex(second)];
        return [
          firstPoint[0] + (secondPoint[0] - firstPoint[0]) * share,
          firstPoint[1] + (secondPoint[1] - firstPoint[1]) * share,
          firstPoint[2] + (secondPoint[2] - firstPoint[2]) * share,
        ];
      });
      const crossSection = toCrossSection(points);
      const parent = previousLevel.reduce((nearest, candidate) =>
        toDistance(nodes[candidate]?.centre ?? crossSection.centre, crossSection.centre) <
        toDistance(nodes[nearest]?.centre ?? crossSection.centre, crossSection.centre)
          ? candidate
          : nearest,
      );
      levelNodes.push(nodes.length);
      nodes.push({
        ...crossSection,
        farVertices: edges.map(([first, second]) => (checkIsPast(first) ? first : second)),
        level,
        parent,
      });
    }
    previousLevel = levelNodes;
  }
  // A node nothing grows from closes on the farthest vertex its loop leads to
  const parentNodes = new Set(nodes.map(({ parent }) => parent));
  const leaves = [...nodes.entries()].filter(([index]) => !parentNodes.has(index));
  for (const [leaf, { farVertices, level }] of leaves) {
    const cut = level * levelStep;
    const reached = new Set(farVertices);
    for (const vertex of reached)
      for (const neighbour of neighbourMap.get(vertex) ?? [])
        if (readDistance(neighbour) >= cut) reached.add(neighbour);
    const tip = [...reached].reduce((farthest, vertex) =>
      readDistance(vertex) > readDistance(farthest) ? vertex : farthest,
    );
    nodes.push({ centre: readVertex(tip), farVertices: [], level: level + 1, parent: leaf, radius: 0 });
  }
  return nodes;
};
