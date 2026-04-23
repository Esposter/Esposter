import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { CompositeKey } from "@esposter/db-schema";
import type { ItemMetadata } from "@esposter/shared";

import { serialize } from "#shared/services/pagination/cursor/serialize";

export const getNextCursor = <TItem extends CompositeKey | ItemMetadata>(
  items: TItem[],
  sortBy: SortItem<keyof TItem & string>[],
) => {
  const nextItem = items.at(-1);
  if (!nextItem) return undefined;
  return serialize(nextItem, sortBy);
};
