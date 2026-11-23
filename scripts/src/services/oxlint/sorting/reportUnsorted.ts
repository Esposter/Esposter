import type { SortingItem } from "#src/models/oxlint/sorting/SortingItem";
import type { Context } from "@oxlint/plugins";

import { buildOrderFixes } from "#src/services/oxlint/sorting/buildOrderFixes";
import { compareNames } from "#src/services/oxlint/sorting/compareNames";
import { splitAtImpureItems } from "#src/services/oxlint/sorting/splitAtImpureItems";

// Reports every item that sorts before the one ahead of it, at the item, as perfectionist does. Each report carries
// The fix that rewrites its run in order, so one fix pass sorts it; items sorting equal keep their order
// Returns whether the run is out of order
const reportRun = (
  context: Context,
  items: SortingItem[],
  compareItems: (left: SortingItem, right: SortingItem) => number,
): boolean => {
  if (items.length < 2) return false;
  const sortedItems = items.toSorted(compareItems);
  if (sortedItems.every((item, index) => item === items[index])) return false;
  for (const [index, item] of items.entries()) {
    const previousItem = items[index - 1];
    if (previousItem === undefined || compareItems(previousItem, item) <= 0) continue;
    context.report({
      fix: (fixer) => buildOrderFixes(context, fixer, items, sortedItems),
      message: `Expected "${item.name}" to come before "${previousItem.name}".`,
      node: item.node,
    });
  }
  return true;
};

// Returns whether any run of the items is out of order
export const reportUnsorted = (
  context: Context,
  items: SortingItem[],
  compareItems: (left: SortingItem, right: SortingItem) => number = (left, right) =>
    compareNames(left.name, right.name),
): boolean =>
  splitAtImpureItems(items)
    .map((run) => reportRun(context, run, compareItems))
    .includes(true);
