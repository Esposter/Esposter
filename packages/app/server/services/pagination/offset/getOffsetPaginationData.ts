import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { OffsetPaginationData } from "#shared/models/pagination/offset/OffsetPaginationData";

export const getOffsetPaginationData = <TItem extends ToData<AEntity>>(
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
