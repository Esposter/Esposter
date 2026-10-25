import type { PathPoint } from "#src/models/genshinAssets/fit/PathPoint";
import type { SkeletonNode } from "#src/models/genshinAssets/fit/SkeletonNode";

import { toDistance } from "#src/services/genshinAssets/fit/toDistance";

// A skeleton's nodes as the paths a tube is swept along, each a node's centre and radius: from its start, each path
// Keeps to the child leading farthest on, and every other child starts a path of its own at the node it forks from, in
// The child's radius so it grows from inside its parent
export const toPaths = (nodes: readonly SkeletonNode[]): PathPoint[][] => {
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
    const [start, forkChild] = fork;
    const startNode = nodes[start];
    if (!startNode) continue;
    const path = [toPoint(startNode)];
    let current = forkChild ?? start;
    if (forkChild !== undefined) {
      const child = nodes[forkChild];
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
