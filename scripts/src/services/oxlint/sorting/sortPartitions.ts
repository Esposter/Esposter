import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";

import { sortNodesByDependencies } from "#src/services/oxlint/sorting/sortNodesByDependencies";

// Sorts one partition by the comparer. A node disabled for the rule is held at its index instead, when asked to
const sortPartitionNodes = <T extends SortingNode>(
  nodes: T[],
  compare: (left: T, right: T) => number,
  ignoreOxlintDisabledNodes: boolean,
): T[] => {
  const pinnedNodes: [number, T][] = [];
  const movableNodes: T[] = [];
  for (const [index, node] of nodes.entries())
    if (ignoreOxlintDisabledNodes && node.isOxlintDisabled) pinnedNodes.push([index, node]);
    else movableNodes.push(node);
  return pinnedNodes.reduce(
    (sortedNodes, [index, node]) => sortedNodes.toSpliced(index, 0, node),
    movableNodes.toSorted(compare),
  );
};

// Every partition sorted in turn, partitions never mixing, then the whole list ordered by its dependencies
export const sortPartitions = <T extends SortingNode>(
  partitions: T[][],
  compare: (left: T, right: T) => number,
  ignoreOxlintDisabledNodes: boolean,
  nodesInCycles: Set<SortingNode>,
): T[] =>
  sortNodesByDependencies(
    partitions.flatMap((nodes) => sortPartitionNodes(nodes, compare, ignoreOxlintDisabledNodes)),
    ignoreOxlintDisabledNodes,
    nodesInCycles,
  );
