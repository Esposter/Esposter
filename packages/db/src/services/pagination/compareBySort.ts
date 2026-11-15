import type { PageSort } from "@esposter/db-schema";

import { toPageCursorValue } from "#src/services/pagination/toPageCursorValue";
import { SortOrder } from "@esposter/db-schema";

// The list's order in JavaScript, for a page merged from several sources: each answers its rows after the cursor, and the
// Union is ordered by this before toPage keeps the first of them. Values compare as SQLite compares them
export const compareBySort =
  <TKey extends string>({ keys, order }: PageSort<TKey>) =>
  (left: Record<TKey, unknown>, right: Record<TKey, unknown>): number => {
    for (const key of keys) {
      const leftValue = toPageCursorValue(left[key]);
      const rightValue = toPageCursorValue(right[key]);
      if (leftValue === rightValue) continue;
      const comparison = leftValue < rightValue ? -1 : 1;
      return order === SortOrder.Asc ? comparison : -comparison;
    }
    return 0;
  };
