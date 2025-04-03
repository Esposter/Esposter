import type { AItemEntity } from "#shared/models/entity/AItemEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { serialize } from "@@/server/services/pagination/cursor/serialize";

export const getNextCursor = <TItem extends ToData<AItemEntity>>(
  items: TItem[],
  sortBy: SortItem<keyof TItem & string>[],
) => {
  const nextItem = items.at(-1);
  return serialize(nextItem, sortBy);
};
