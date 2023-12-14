import type { Item } from "@/models/shared/Item";
import type { OffsetPaginationData } from "@/models/shared/pagination/OffsetPaginationData";

export const getOffsetPaginationData = <TItem extends Item>(
  items: TItem[],
  offset: number,
  limit: number,
): OffsetPaginationData<TItem> => {
  const hasMore = items.length > limit;
  const filteredItems = hasMore ? items.slice(0, limit) : items;
  return {
    items: filteredItems,
    offset,
    hasMore,
  };
};
