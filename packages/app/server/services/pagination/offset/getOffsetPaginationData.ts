import type { ItemMetadata } from "@/shared/models/entity/ItemMetadata";
import type { OffsetPaginationData } from "@/shared/models/pagination/offset/OffsetPaginationData";

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
