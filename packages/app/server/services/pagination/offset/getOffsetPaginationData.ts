import type { OffsetPaginationData } from "@/models/shared/pagination/offset/OffsetPaginationData";
import type { ItemMetadata } from "@/shared/models/itemMetadata";

export const getOffsetPaginationData = <TItem extends ItemMetadata>(
  items: TItem[],
  limit: number,
): OffsetPaginationData<TItem> => {
  const hasMore = items.length > limit;
  const filteredItems = hasMore ? items.slice(0, limit) : items;
  return {
    hasMore,
    items: filteredItems,
  };
};
