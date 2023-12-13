import type { Item } from "@/models/shared/Item";

export const getNextCursor = <TItem extends Item, TItemKey extends keyof TItem>(
  items: TItem[],
  itemCursorKey: TItemKey,
  readLimit: number,
) => {
  let nextCursor: TItem[TItemKey] | null = null;
  if (items.length > readLimit) {
    const nextItem = items.pop();
    if (nextItem) nextCursor = nextItem[itemCursorKey];
  }
  return nextCursor;
};
