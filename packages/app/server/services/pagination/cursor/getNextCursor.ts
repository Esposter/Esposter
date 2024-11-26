import type { SortItem } from "@/shared/models/pagination/sorting/SortItem";
import type { ItemMetadata } from "~/shared/models/entity/ItemMetadata";

import { serialize } from "@/server/services/pagination/cursor/serialize";

export const getNextCursor = <TItem extends ItemMetadata>(items: TItem[], sortBy: SortItem<keyof TItem & string>[]) => {
  const nextItem = items.at(-1);
  return serialize(nextItem, sortBy);
};
