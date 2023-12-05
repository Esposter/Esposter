import type { PaginationData } from "@/models/shared/pagination/PaginationData";
import { getNextCursor } from "@/services/shared/pagination/getNextCursor";

export const getPaginationData = <T extends object>(
  items: T[],
  itemCursorKey: keyof T,
  limit: number,
): PaginationData<T> => {
  const hasMore = items.length === limit;
  const filteredItems = hasMore ? items.slice(0, limit) : items;
  return {
    items,
    // We'll assert here that the cursor value will always be a string
    nextCursor: getNextCursor(filteredItems, itemCursorKey, limit) as string | null,
    hasMore,
  };
};
