import type { SortItem } from "#shared/models/pagination/sorting/SortItem";
import type { CompositeKey } from "@esposter/azure";
import type { ItemMetadata } from "@esposter/shared";

import { serialize } from "#shared/services/pagination/cursor/serialize";

export const getNextCursor = <TItem extends CompositeKey | ItemMetadata>(
  items: TItem[],
  sortBy: SortItem<keyof TItem & string>[],
) => {
  const lastItem = items.at(-1);
  if (!lastItem) return "";
  return serialize(lastItem, sortBy);
};
