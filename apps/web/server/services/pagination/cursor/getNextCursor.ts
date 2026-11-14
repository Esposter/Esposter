import type { SortItem } from "#shared/models/pagination/sorting/SortItem";

import type { ItemMetadata } from "@esposter/shared";
import type { CompositeKey } from "@esposter/db-schema";

import { serialize } from "#shared/services/pagination/cursor/serialize";

export const getNextCursor = <TItem extends CompositeKey | ItemMetadata>(
  items: TItem[],
  sortBy: SortItem<keyof TItem & string>[],
) => {
  const lastItem = items.at(-1);
  if (lastItem) return serialize(lastItem, sortBy);
  else return "";
};
