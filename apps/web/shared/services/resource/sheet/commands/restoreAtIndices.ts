import { takeOne } from "@esposter/shared";

// Puts each item back at the index it was removed from, in one walk over what remains rather than a splice per
// Item — the undo of a bulk delete is on the same rows the delete was benched on. The restored items are read
// Lowest index first, so the caller hands them over ascending
export const restoreAtIndices = <T>(items: T[], restoredItems: { index: number; item: T }[]) => {
  const mergedItems: T[] = [];
  let existingIndex = 0;
  for (const { index, item } of restoredItems) {
    while (mergedItems.length < index) {
      mergedItems.push(takeOne(items, existingIndex));
      existingIndex++;
    }
    mergedItems.push(item);
  }
  while (existingIndex < items.length) {
    mergedItems.push(takeOne(items, existingIndex));
    existingIndex++;
  }
  return mergedItems;
};
