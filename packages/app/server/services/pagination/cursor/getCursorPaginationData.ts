import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { CompositeKey } from "@esposter/azure";
import type { ItemMetadata } from "@esposter/shared";

import { getNextCursor } from "@@/server/services/pagination/cursor/getNextCursor";
import { getBasePaginationData } from "@@/server/services/pagination/getBasePaginationData";

export const getCursorPaginationData = <TItem extends CompositeKey | ItemMetadata>(
  items: TItem[],
  limit: number,
  sortBy: SortItem<keyof TItem & string>[],
): CursorPaginationData<TItem> => {
  const { hasMore, items: pageItems } = getBasePaginationData(items, limit);
  // The cursor names the last item the page kept, never the extra one that answered `hasMore` — a cursor
  // Past the dropped item would skip it on the next read
  return { hasMore, items: pageItems, nextCursor: getNextCursor(pageItems, sortBy) };
};
