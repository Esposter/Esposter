import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";

import { computePinnedNodes } from "#src/services/oxlint/sorting/computePinnedNodes";
import { sortNodesByDependencies } from "#src/services/oxlint/sorting/sortNodesByDependencies";

// Sorts one partition by the comparer. A node held for the rule (`computePinnedNodes`) keeps its index instead, when
// Asked
const sortPartitionNodes = <T extends SortingNode>(
  nodes: T[],
  compare: (left: T, right: T) => number,
  pinnedNodes: Set<T>,
): T[] => {
  const pinnedIndexes: [number, T][] = [];
  const movableNodes: T[] = [];
  for (const [index, node] of nodes.entries())
    if (pinnedNodes.has(node)) pinnedIndexes.push([index, node]);
    else movableNodes.push(node);
  return pinnedIndexes.reduce(
    (sortedNodes, [index, node]) => sortedNodes.toSpliced(index, 0, node),
    movableNodes.toSorted(compare),
  );
};

// Every partition sorted in turn, partitions never mixing, and each ordered by its own dependencies: a dependency that
// Lies in another partition is not pulled across it, so no node moves past an impure partition's calls
export const sortPartitions = <T extends SortingNode>(
  partitions: T[][],
  compare: (left: T, right: T) => number,
  ignoreOxlintDisabledNodes: boolean,
  nodesInCycles: Set<SortingNode>,
): T[] =>
  partitions.flatMap((nodes) => {
    const pinnedNodes = ignoreOxlintDisabledNodes ? computePinnedNodes(nodes) : new Set<T>();
    return sortNodesByDependencies(sortPartitionNodes(nodes, compare, pinnedNodes), pinnedNodes, nodesInCycles);
  });
