import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";

import { checkIsNodeDependentOnOtherNode } from "#src/services/oxlint/sorting/checkIsNodeDependentOnOtherNode";
import { computePinnedNodes } from "#src/services/oxlint/sorting/computePinnedNodes";

// Orders nodes so each comes after the nodes it reads, keeping the given order wherever no dependency asks otherwise.
// A node on a cycle keeps its order among the cycle's nodes, so each one waits for the cycle's nodes given before it.
// A node that reads a cycle's node waits for it, and a node held for the rule (`computePinnedNodes`) is never pulled
// Ahead of anything when `ignoreOxlintDisabledNodes` is set
export const sortNodesByDependencies = <T extends SortingNode>(
  nodes: T[],
  ignoreOxlintDisabledNodes: boolean,
  nodesInCycles: Set<SortingNode>,
): T[] => {
  const pinnedNodes = ignoreOxlintDisabledNodes ? computePinnedNodes(nodes) : new Set<T>();
  const cyclicNodes = nodes.filter((node) => nodesInCycles.has(node));
  const sortedNodes: T[] = [];
  const visitedNodes = new Set<T>();
  const visitNode = (sortingNode: T): void => {
    if (visitedNodes.has(sortingNode)) return;
    visitedNodes.add(sortingNode);
    const isCyclic = nodesInCycles.has(sortingNode);
    if (isCyclic)
      for (const cyclicNode of cyclicNodes.slice(0, cyclicNodes.indexOf(sortingNode)))
        if (!pinnedNodes.has(cyclicNode)) visitNode(cyclicNode);
    for (const node of nodes)
      if (
        checkIsNodeDependentOnOtherNode(node, sortingNode) &&
        !pinnedNodes.has(node) &&
        !(isCyclic && nodesInCycles.has(node))
      )
        visitNode(node);
    sortedNodes.push(sortingNode);
  };
  for (const node of nodes) visitNode(node);
  return sortedNodes;
};
