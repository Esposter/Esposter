import type { AEntity } from "#shared/models/entity/AEntity";
import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { CompositeKey } from "@esposter/db-schema";
import type { ToData } from "@esposter/shared";

import { serialize } from "#shared/services/pagination/cursor/serialize";

export const getNextCursor = <TItem extends CompositeKey | ToData<AEntity>>(
  items: TItem[],
  sortBy: SortItem<keyof TItem & string>[],
) => {
  const nextItem = items.at(-1);
  if (!nextItem) return;
  return serialize(nextItem, sortBy);
};
