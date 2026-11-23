import type { SortingNode } from "#src/models/oxlint/sorting/SortingNode";
import type { Context } from "@oxlint/plugins";

import { buildOrderFixes } from "#src/services/oxlint/sorting/buildOrderFixes";
import { checkIsNodeDependentOnOtherNode } from "#src/services/oxlint/sorting/checkIsNodeDependentOnOtherNode";
import { computeNodesInCircularDependencies } from "#src/services/oxlint/sorting/computeNodesInCircularDependencies";
import { sortPartitions } from "#src/services/oxlint/sorting/sortPartitions";
import { splitAtImpureItems } from "#src/services/oxlint/sorting/splitAtImpureItems";

const toSingleLine = (text: string): string => text.replaceAll(/\s{2,}/gu, " ").trim();

// Reports each node that sorts before the one ahead of it, at the node, and each node that reads a name bound after it.
// A node disabled for the rule keeps its place, and the fix moves every other node into the order the sort gives
export const reportSortingPartitions = (
  context: Context,
  unsplitPartitions: SortingNode[][],
  compare: (left: SortingNode, right: SortingNode) => number,
  isSafetySemicolonNeeded: boolean,
): void => {
  const partitions = unsplitPartitions.flatMap((partition) => splitAtImpureItems(partition));
  const nodes = partitions.flat();
  const nodesInCycles = computeNodesInCircularDependencies(nodes);
  const sortedNodes = sortPartitions(partitions, compare, false, nodesInCycles);
  const sortedNodesExcludingOxlintDisabled = sortPartitions(partitions, compare, true, nodesInCycles);
  const nodeIndexMap = new Map<SortingNode, number>(sortedNodes.map((node, index) => [node, index] as const));
  const nodeIndexExcludingOxlintDisabledMap = new Map<SortingNode, number>(
    sortedNodesExcludingOxlintDisabled.map((node, index) => [node, index] as const),
  );
  const nodeOrderMap = new Map<SortingNode, number>(nodes.map((node, index) => [node, index] as const));
  const getFirstUnorderedNodeDependentOn = (node: SortingNode): SortingNode | undefined =>
    nodes.find(
      (otherNode) =>
        !nodesInCycles.has(otherNode) &&
        (nodeOrderMap.get(otherNode) ?? 0) < (nodeOrderMap.get(node) ?? 0) &&
        checkIsNodeDependentOnOtherNode(node, otherNode),
    );

  for (const [index, right] of nodes.entries()) {
    const left = nodes[index - 1];
    if (left === undefined) continue;
    const dependentNode = getFirstUnorderedNodeDependentOn(right);
    const leftIndex = nodeIndexMap.get(left) ?? 0;
    const isOutOfOrder =
      leftIndex > (nodeIndexMap.get(right) ?? 0) ||
      (left.isOxlintDisabled && leftIndex >= (nodeIndexExcludingOxlintDisabledMap.get(right) ?? 0));
    if (dependentNode === undefined && !isOutOfOrder) continue;
    const message =
      dependentNode === undefined
        ? `Expected "${toSingleLine(right.name)}" to come before "${toSingleLine(left.name)}".`
        : `Expected dependency "${toSingleLine(right.name)}" to come before "${toSingleLine(dependentNode.name)}".`;
    context.report({
      fix: (fixer) =>
        buildOrderFixes(context, fixer, nodes, sortedNodesExcludingOxlintDisabled, isSafetySemicolonNeeded),
      message,
      node: right.node,
    });
  }
};
