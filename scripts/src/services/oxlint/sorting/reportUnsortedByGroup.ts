import type { SortingGroupItem } from "#src/models/oxlint/sorting/SortingGroupItem";
import type { Context } from "@oxlint/plugins";

import { buildOrderFixes } from "#src/services/oxlint/sorting/buildOrderFixes";
import { checkIsNodeDependentOnOtherNode } from "#src/services/oxlint/sorting/checkIsNodeDependentOnOtherNode";
import { compareNames } from "#src/services/oxlint/sorting/compareNames";
import { computeNodesInCircularDependencies } from "#src/services/oxlint/sorting/computeNodesInCircularDependencies";
import { sortNodesByDependencies } from "#src/services/oxlint/sorting/sortNodesByDependencies";
import { splitAtImpureItems } from "#src/services/oxlint/sorting/splitAtImpureItems";

// Reports each item that sorts out of place against the one ahead of it, at the item, as perfectionist's class sort
// Does. An item a reader ahead of it depends on is a dependency error; otherwise an item sorting before its neighbour
// Is a group error across groups and an order error within one. The fix rewrites the whole list in the sorted order
// Reports each item that sorts out of place against the one ahead of it, at the item, as perfectionist's class sort
// Does. An item a reader ahead of it depends on is a dependency error; otherwise an item sorting before its neighbour
// Is a group error across groups and an order error within one. Each run an impure item splits the list into sorts on
// Its own, so the fix rewrites the whole list with every run in its sorted order
export const reportUnsortedByGroup = (context: Context, items: SortingGroupItem[]): void => {
  if (items.length < 2) return;
  const nodesInCycles = computeNodesInCircularDependencies(items);
  const sortedItems = splitAtImpureItems(items).flatMap((run) =>
    sortNodesByDependencies(
      run.toSorted((left, right) => left.groupIndex - right.groupIndex || compareNames(left.name, right.name)),
      false,
      nodesInCycles,
    ),
  );
  const sortedIndexMap = new Map<SortingGroupItem, number>(sortedItems.map((item, index) => [item, index] as const));
  for (const [index, item] of items.entries()) {
    const previousItem = items[index - 1];
    if (previousItem === undefined) continue;
    const dependentItem = items
      .slice(0, index)
      .find((candidate) => !nodesInCycles.has(candidate) && checkIsNodeDependentOnOtherNode(item, candidate));
    let message: string | undefined;
    if (dependentItem) message = `Expected dependency "${item.name}" to come before "${dependentItem.name}".`;
    else if ((sortedIndexMap.get(previousItem) ?? 0) > (sortedIndexMap.get(item) ?? 0))
      message =
        previousItem.groupIndex === item.groupIndex
          ? `Expected "${item.name}" to come before "${previousItem.name}".`
          : `Expected "${item.name}" (${item.group}) to come before "${previousItem.name}" (${previousItem.group}).`;
    if (message === undefined) continue;
    context.report({ fix: (fixer) => buildOrderFixes(context, fixer, items, sortedItems), message, node: item.node });
  }
};
