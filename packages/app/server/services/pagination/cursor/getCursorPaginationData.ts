import type { AEntity } from "#shared/models/entity/AEntity";
import type { CursorPaginationData } from "#shared/models/pagination/cursor/CursorPaginationData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { ToData } from "@esposter/shared";

import { getNextCursor } from "@@/server/services/pagination/cursor/getNextCursor";
import { CompositeKey } from "@esposter/shared";

export const getCursorPaginationData = <TItem extends CompositeKey | ToData<AEntity>>(
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
