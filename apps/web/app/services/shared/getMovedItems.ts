import { takeOne } from "@esposter/shared";

// The list with one item moved one place, or undefined when the move cannot happen — the index is a lookup that missed,
// Or the item is already at the edge it is moving towards — so the caller skips the write rather than persisting an
// Unchanged order
export const getMovedItems = <T>(items: T[], index: number, direction: -1 | 1) => {
  if (index === -1) return undefined;
  const toIndex = index + direction;
  if (toIndex < 0 || toIndex >= items.length) return undefined;
  const movedItem = takeOne(items, index);
  return items.toSpliced(index, 1).toSpliced(toIndex, 0, movedItem);
};
