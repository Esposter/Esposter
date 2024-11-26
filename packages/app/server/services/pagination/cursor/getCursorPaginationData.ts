import type { ItemMetadata } from "@/shared/models/entity/ItemMetadata";
import type { CursorPaginationData } from "@/shared/models/pagination/cursor/CursorPaginationData";
import type { SortItem } from "@/shared/models/pagination/sorting/SortItem";

import { getNextCursor } from "@/server/services/pagination/cursor/getNextCursor";

export const getCursorPaginationData = <TItem extends ItemMetadata>(
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
