import type { Page, PageCursor, PageSort } from "@esposter/db-schema";

import { compareBySort } from "#src/services/pagination/compareBySort";
import { toPage } from "#src/services/pagination/toPage";

// One page merged from several sources: each answers up to `limit + 1` rows after the cursor, which is the most the page
// Can take from it, and their union is ordered by the sort before the page keeps the first `limit`
export const toMergedPage = <TKey extends string, TItem extends Record<TKey, unknown>>(
  sources: TItem[][],
  sort: PageSort<TKey>,
  cursor: PageCursor,
  limit: number,
): Page<TItem> => toPage(sources.flat().toSorted(compareBySort(sort)), sort, cursor, limit);
