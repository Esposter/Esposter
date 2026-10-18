import type { GridItem } from "#src/models/GridItem";

import { checkIsColliding } from "#src/placement/checkIsColliding";

// Each item rises as far as it can in row-then-column order, until it touches another or the top. One that starts
// Inside another is moved down until it clears, so a compacted layout never overlaps
export const compactLayout = <T extends GridItem>(layout: T[]): T[] => {
  const placedItems: T[] = [];
  const sortedItems = layout.map((item) => ({ ...item })).toSorted((a, b) => a.y - b.y || a.x - b.x);
  for (const item of sortedItems) {
    const checkIsBlocked = (candidate: T) => placedItems.some((placedItem) => checkIsColliding(candidate, placedItem));
    while (item.y > 0 && !checkIsBlocked({ ...item, y: item.y - 1 })) item.y -= 1;
    while (checkIsBlocked(item)) item.y += 1;
    placedItems.push(item);
  }
  return placedItems;
};
