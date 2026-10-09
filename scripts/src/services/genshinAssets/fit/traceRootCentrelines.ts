import type { Vector } from "#src/models/shared/Vector";
import type { TreeRoot } from "genshin-engine";

import { joinMeshVertices } from "#src/services/genshinAssets/fit/joinMeshVertices";
import { simplifyPath } from "#src/services/genshinAssets/fit/simplifyPath";
import { splitMeshComponents } from "#src/services/genshinAssets/fit/splitMeshComponents";

type PathPoint = [number, number, number, number];
// A point of a piece's skeleton: a cross-section's centre and radius, or its start or its tip, and the point it grows
// From, none for its start
interface SkeletonNode {
  centre: Vector;
  // The vertices standing past the cross-section, the far end of each edge it cuts, which its piece's tip is found from
  farVertices: number[];
  level: number;
  parent?: number;
  radius: number;
}

const toDistance = (first: Readonly<Vector>, second: Readonly<Vector>): number =>
  Math.hypot(first[0] - second[0], first[1] - second[1], first[2] - second[2]);
const toEdgeKey = (first: number, second: number): string =>
  first < second ? `${first},${second}` : `${second},${first}`;
const AXES = [0, 1, 2] as const;
// Points' centroid and their mean distance from it
const toCrossSection = (points: readonly Vector[]): Pick<SkeletonNode, "centre" | "radius"> => {
  const centre: Vector = [0, 0, 0];
  for (const point of points) for (const axis of AXES) centre[axis] += point[axis] / points.length;
  return { centre, radius: points.reduce((sum, point) => sum + toDistance(point, centre), 0) / points.length };
};
// One piece's skeleton: its vertices' distances along its edges from its start, cut at every step of that distance into
// The loops each level crosses the piece in, each loop a node grown from the nearest node a step nearer the start, and
// The piece's farthest vertex past each loop nothing grows from, its tip
const traceSkeleton = (
  vertices: readonly Vector[],
  pieceFaces: readonly Vector[],
  levelStep: number,
): SkeletonNode[] => {
  const edgeFaceCountMap = new Map<string, number>();
  const edgeVerticesMap = new Map<string, [number, number]>();
  const neighbourMap = new Map<number, number[]>();
  for (const face of pieceFaces)
    for (const [corner, first] of face.entries()) {
      const second = face[(corner + 1) % 3] ?? first;
      const key = toEdgeKey(first, second);
      const faceCount = edgeFaceCountMap.get(key) ?? 0;
      edgeFaceCountMap.set(key, faceCount + 1);
      if (faceCount > 0) continue;
      edgeVerticesMap.set(key, [first, second]);
      neighbourMap.set(first, [...(neighbourMap.get(first) ?? []), second]);
      neighbourMap.set(second, [...(neighbourMap.get(second) ?? []), first]);
    }
  const pieceVertices = [...neighbourMap.keys()];
  const readVertex = (vertex: number): Vector => vertices[vertex] ?? [0, 0, 0];
  // The piece starts at its open end, where it leaves the trunk or the root it forks from, else at its vertex nearest
  // The trunk's axis
  const openVertices = [
    ...new Set(
      [...edgeFaceCountMap].flatMap(([key, faceCount]) => (faceCount === 1 ? (edgeVerticesMap.get(key) ?? []) : [])),
    ),
  ];
  const startVertices =
    openVertices.length > 0
      ? openVertices
      : [
          pieceVertices.reduce((nearest, vertex) =>
            Math.hypot(readVertex(vertex)[0], readVertex(vertex)[2]) <
            Math.hypot(readVertex(nearest)[0], readVertex(nearest)[2])
              ? vertex
              : nearest,
          ),
        ];
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
    { ...toCrossSection(startVertices.map((vertex) => readVertex(vertex))), farVertices: startVertices, level: 0 },
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
// A skeleton's nodes as the paths a tube is swept along, each a node's centre and radius: from its start, each path
// Keeps to the child leading farthest on, and every other child starts a path of its own at the node it forks from, in
// The child's radius so it grows from inside its parent
const toPaths = (nodes: readonly SkeletonNode[]): PathPoint[][] => {
  const childrenMap = Map.groupBy(
    [...nodes.keys()].filter((index) => nodes[index]?.parent !== undefined),
    (index) => nodes[index]?.parent ?? 0,
  );
  const reaches = nodes.map(() => 0);
  for (let index = nodes.length - 1; index > 0; index--) {
    const node = nodes[index];
    const parent = node?.parent ?? 0;
    const reach = (reaches[index] ?? 0) + toDistance(node?.centre ?? [0, 0, 0], nodes[parent]?.centre ?? [0, 0, 0]);
    reaches[parent] = Math.max(reaches[parent] ?? 0, reach);
  }
  const toPoint = ({ centre: [x, y, z], radius }: SkeletonNode): PathPoint => [x, y, z, radius];
  const paths: PathPoint[][] = [];
  const forks: [number, number | undefined][] = [[0, undefined]];
  for (let fork = forks.pop(); fork; fork = forks.pop()) {
    const [start, firstChild] = fork;
    const startNode = nodes[start];
    if (!startNode) continue;
    const path = [toPoint(startNode)];
    let current = firstChild ?? start;
    if (firstChild !== undefined) {
      const child = nodes[firstChild];
      path[0] = toPoint({ ...startNode, radius: child?.radius ?? startNode.radius });
      if (child) path.push(toPoint(child));
    }
    for (
      let children = childrenMap.get(current) ?? [];
      children.length > 0;
      children = childrenMap.get(current) ?? []
    ) {
      const [next = current, ...others] = children.toSorted(
        (firstChild, secondChild) => (reaches[secondChild] ?? 0) - (reaches[firstChild] ?? 0),
      );
      for (const other of others) forks.push([current, other]);
      const nextNode = nodes[next];
      if (nextNode) path.push(toPoint(nextNode));
      current = next;
    }
    paths.push(path);
  }
  return paths;
};
// A mesh of tubes, such as a tree's surface roots, as the centrelines it is swept along, in the mesh's own frame: each
// Piece it splits into is traced from its open end along its own length, cut at every step of that distance into the
// Loops round it, each loop's centroid and mean radius a point, forking where the loops part and closing on its tip with
// No radius. Each path is simplified within the tolerance, its radius weighed as its place is
export const traceRootCentrelines = (
  vertices: readonly Vector[],
  faces: readonly Vector[],
  { levelStep, tolerance }: { levelStep: number; tolerance: number },
): TreeRoot[] => {
  const joined = joinMeshVertices(vertices);
  return splitMeshComponents(vertices, faces).flatMap((pieceFaceIndices) => {
    const pieceFaces = pieceFaceIndices.map((face): Vector => {
      const [first = 0, second = 0, third = 0] = faces[face] ?? [];
      return [joined[first] ?? first, joined[second] ?? second, joined[third] ?? third];
    });
    return toPaths(traceSkeleton(vertices, pieceFaces, levelStep)).flatMap((path): TreeRoot[] => {
      const [first, second, ...rest] = simplifyPath(path, tolerance).map(([x, y, z, radius]) => ({ radius, x, y, z }));
      return first && second ? [[first, second, ...rest]] : [];
    });
  });
};
