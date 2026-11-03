import type { GridItem } from "#src/models/GridItem";

import { checkIsColliding } from "#src/placement/checkIsColliding";

// Each item rises as far as it can, in order from the top, until it touches another or the top edge. One that starts
// Inside another is pushed down until it clears, so a compacted layout never overlaps
export const compactLayout = <T extends GridItem>(layout: T[]): T[] => {
  const copies = layout.map((item) => ({ ...item }));
  const placedItems: T[] = [];
  const checkIsBlocked = (candidate: T) => placedItems.some((placedItem) => checkIsColliding(candidate, placedItem));
  const sortedItems = copies.toSorted(
    (firstItem, secondItem) => firstItem.y - secondItem.y || firstItem.x - secondItem.x,
  );
  for (const item of sortedItems) {
    while (item.y > 0 && !checkIsBlocked({ ...item, y: item.y - 1 })) item.y -= 1;
    while (checkIsBlocked(item)) item.y += 1;
    placedItems.push(item);
  }
  return placedItems;
};
