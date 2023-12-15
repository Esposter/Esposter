import { type Item } from "@/models/shared/Item";
import { type CursorPaginationData } from "@/models/shared/pagination/CursorPaginationData";
import { getNextCursor } from "@/services/shared/pagination/getNextCursor";

export const getCursorPaginationData = <TItem extends Item, TItemKey extends keyof TItem>(
  items: TItem[],
  itemCursorKey: TItemKey,
  limit: number,
): CursorPaginationData<TItem, TItemKey> => {
  const hasMore = items.length > limit;
  const filteredItems = hasMore ? items.slice(0, limit) : items;
  return {
    items: filteredItems,
    nextCursor: getNextCursor(filteredItems, itemCursorKey, limit),
    hasMore,
  };
};
