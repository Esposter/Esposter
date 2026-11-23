import type { SortingItem } from "#src/models/oxlint/sorting/SortingItem";

import { checkIsPureExpression } from "#src/services/oxlint/sorting/checkIsPureExpression";

// Whether an item's evaluated part runs code, so the sort must leave it where the source puts it
const checkIsImpureItem = (item: SortingItem): boolean =>
  item.evaluated !== undefined && !checkIsPureExpression(item.evaluated);

// The runs a sort may reorder. An impure item is a run of its own, so no item moves across it and it never moves
export const splitAtImpureItems = <T extends SortingItem>(items: T[]): T[][] => {
  const runs: T[][] = [[]];
  for (const item of items)
    if (checkIsImpureItem(item)) runs.push([item], []);
    else runs.at(-1)?.push(item);
  return runs.filter((run) => run.length > 0);
};
