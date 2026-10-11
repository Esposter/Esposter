import { takeOne } from "@esposter/shared";

// The list with one item moved to another place, or undefined when the move changes nothing — the index is a lookup
// That missed, the place is past either end, or it is where the item already sits — so the caller skips the write
// Rather than persisting an unchanged order
export const getMovedItems = <T>(items: T[], index: number, toIndex: number) => {
  if (index === -1 || index === toIndex || toIndex < 0 || toIndex >= items.length) return undefined;
  const movedItem = takeOne(items, index);
  return items.toSpliced(index, 1).toSpliced(toIndex, 0, movedItem);
};
