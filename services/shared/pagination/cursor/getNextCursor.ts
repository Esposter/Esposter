import { type ItemMetadata } from "@/models/shared/ItemMetadata";
import { type SortItem } from "@/models/shared/pagination/sorting/SortItem";
import { serialize } from "@/services/shared/pagination/cursor/serialize";

export const getNextCursor = <TItem extends ItemMetadata>(
  items: TItem[],
  limit: number,
  sortBy: SortItem<keyof TItem & string>[],
) => {
  let nextCursor: string | null = null;
  if (items.length > limit) {
    const nextItem = items.pop();
    if (nextItem) nextCursor = serialize(nextItem, sortBy);
  }
  return nextCursor;
};
