import type { SortingItem } from "#src/models/oxlint/sorting/SortingItem";
import type { Context } from "@oxlint/plugins";

import { buildOrderFixes } from "#src/services/oxlint/sorting/buildOrderFixes";
import { compareNames } from "#src/services/oxlint/sorting/compareNames";
import { splitAtImpureItems } from "#src/services/oxlint/sorting/splitAtImpureItems";

// Reports every item that sorts before the one ahead of it, at the item, as perfectionist does. Each report carries
// The fix that rewrites its run in order, so one fix pass sorts it; items sorting equal keep their order
const reportRun = (
  context: Context,
  items: SortingItem[],
  compareItems: (left: SortingItem, right: SortingItem) => number,
): void => {
  if (items.length < 2) return;
  const sortedItems = items.toSorted(compareItems);
  if (sortedItems.every((item, index) => item === items[index])) return;
  for (const [index, item] of items.entries()) {
    const previousItem = items[index - 1];
    if (previousItem === undefined || compareItems(previousItem, item) <= 0) continue;
    context.report({
      fix: (fixer) => buildOrderFixes(context, fixer, items, sortedItems),
      message: `Expected "${item.name}" to come before "${previousItem.name}".`,
      node: item.node,
    });
  }
};

export const reportUnsorted = (
  context: Context,
  items: SortingItem[],
  compareItems: (left: SortingItem, right: SortingItem) => number = (left, right) =>
    compareNames(left.name, right.name),
): void => {
  for (const run of splitAtImpureItems(items)) reportRun(context, run, compareItems);
};
