import type { AEntity } from "#shared/models/entity/AEntity";
import type { ToData } from "#shared/models/entity/ToData";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import { serialize } from "#shared/services/pagination/cursor/serialize";

export const getNextCursor = <TItem extends ToData<AEntity>>(
  items: TItem[],
  sortBy: SortItem<keyof TItem & string>[],
) => {
  const nextItem = items.at(-1);
  return serialize(nextItem, sortBy);
};
