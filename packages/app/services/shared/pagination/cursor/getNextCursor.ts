import type { SortItem } from "@/models/shared/pagination/sorting/SortItem";
import type { ItemMetadata } from "@/shared/models/itemMetadata";

import { serialize } from "@/services/shared/pagination/cursor/serialize";

export const getNextCursor = <TItem extends ItemMetadata>(items: TItem[], sortBy: SortItem<keyof TItem & string>[]) => {
  const nextItem = items.at(-1);
  return serialize(nextItem, sortBy);
};
