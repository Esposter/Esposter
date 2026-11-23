import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";

import { checkIsNodeDependentOnOtherNode } from "#src/services/oxlint/sorting/checkIsNodeDependentOnOtherNode";

// Orders nodes so each comes after the nodes it reads, keeping the given order wherever no dependency asks otherwise.
// Nodes on a cycle keep their place in the dependency order, and a node disabled for the rule is never moved ahead when
// `ignoreOxlintDisabledNodes` is set
export const sortNodesByDependencies = <T extends SortingNode>(
  nodes: T[],
  ignoreOxlintDisabledNodes: boolean,
  nodesInCycles: Set<SortingNode>,
): T[] => {
  const acyclicNodes = nodes.filter((node) => !nodesInCycles.has(node));
  const sortedNodes: T[] = [];
  const visitedNodes = new Set<T>();
  const visitNode = (sortingNode: T): void => {
    if (visitedNodes.has(sortingNode)) return;
    const dependentNodes = acyclicNodes.filter((node) => checkIsNodeDependentOnOtherNode(node, sortingNode));
    for (const dependentNode of dependentNodes)
      if (!ignoreOxlintDisabledNodes || !dependentNode.isOxlintDisabled) visitNode(dependentNode);
    visitedNodes.add(sortingNode);
    sortedNodes.push(sortingNode);
  };
  for (const node of nodes) visitNode(node);
  return sortedNodes;
};
