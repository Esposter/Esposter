import type { ItemMetadata } from "@/models/shared/ItemMetadata";
import type { CursorPaginationData } from "@/models/shared/pagination/cursor/CursorPaginationData";
import type { SortItem } from "@/models/shared/pagination/sorting/SortItem";
import { getNextCursor } from "@/services/shared/pagination/cursor/getNextCursor";

export const getCursorPaginationData = <TItem extends ItemMetadata>(
  items: TItem[],
  limit: number,
  sortBy: SortItem<keyof TItem & string>[],
): CursorPaginationData<TItem> => {
  const hasMore = items.length > limit;
  const filteredItems = hasMore ? items.slice(0, limit) : items;
  return {
    items: filteredItems,
    nextCursor: getNextCursor(filteredItems, sortBy),
    hasMore,
  };
};
