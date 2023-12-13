import type { Item } from "@/models/shared/Item";
import type { PaginationData } from "@/models/shared/pagination/PaginationData";
import { getNextCursor } from "@/services/shared/pagination/getNextCursor";

export const getPaginationData = <TItem extends Item, TItemKey extends keyof TItem>(
  items: TItem[],
  itemCursorKey: TItemKey,
  limit: number,
): PaginationData<TItem, TItemKey> => {
  const hasMore = items.length === limit;
  const filteredItems = hasMore ? items.slice(0, limit) : items;
  return {
    items,
    nextCursor: getNextCursor(filteredItems, itemCursorKey, limit),
    hasMore,
  };
};
