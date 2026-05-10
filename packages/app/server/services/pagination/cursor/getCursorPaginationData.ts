import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { CompositeKey } from "@esposter/db-schema";
import type { ItemMetadata } from "@esposter/shared";

import { getNextCursor } from "@@/server/services/pagination/cursor/getNextCursor";

export const getCursorPaginationData = <TItem extends CompositeKey | ItemMetadata>(
  items: TItem[],
  limit: number,
  sortBy: SortItem<keyof TItem & string>[],
): CursorPaginationData<TItem> => {
  const hasMore = items.length > limit;
  const filteredItems = hasMore ? items.slice(0, limit) : items;
  return {
    hasMore,
    items: filteredItems,
    nextCursor: getNextCursor(filteredItems, sortBy),
  };
};
