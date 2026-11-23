import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";

import { checkIsNodeDependentOnOtherNode } from "#src/services/oxlint/sorting/checkIsNodeDependentOnOtherNode";

// The nodes a sort holds for the rule when it leaves disabled nodes alone: each node a disable directive covers, and
// Each Node that reads a held one, since a reader moved ahead of what it reads would be bound before it. A reader is
// Held in Its place rather than moved, so the fix never binds it ahead of the node it reads
export const computePinnedNodes = <T extends SortingNode>(nodes: T[]): Set<T> => {
  const pinnedNodes = new Set(nodes.filter((node) => node.isOxlintDisabled));
  const pendingNodes = [...pinnedNodes];
  for (const pinnedNode of pendingNodes)
    for (const node of nodes)
      if (!pinnedNodes.has(node) && checkIsNodeDependentOnOtherNode(pinnedNode, node)) {
        pinnedNodes.add(node);
        pendingNodes.push(node);
      }
  return pinnedNodes;
};
