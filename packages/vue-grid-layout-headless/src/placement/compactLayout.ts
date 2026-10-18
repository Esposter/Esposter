import type { GridItem } from "#src/models/GridItem";

import { CompactType } from "#src/models/CompactType";
import { checkIsColliding } from "#src/placement/checkIsColliding";

// Each item rises along the compaction axis as far as it can, in order along it, until it touches another or the
// Edge. A horizontal compaction that would push an item past the last column moves it down a row and starts it again
// From the right edge. One that starts inside another is pushed along the axis until it clears, so a compacted layout
// Never overlaps. A layout with no compaction keeps each item where it was placed, and still pushes an overlapping one
// Down until it clears
export const compactLayout = <T extends GridItem>(layout: T[], columnNumber: number, compactType: CompactType): T[] => {
  const copies = layout.map((item) => ({ ...item }));
  const isHorizontal = compactType === CompactType.Horizontal;
  const axis = isHorizontal ? "x" : "y";
  const crossAxis = isHorizontal ? "y" : "x";
  const placedItems: T[] = [];
  const checkIsBlocked = (candidate: T) => placedItems.some((placedItem) => checkIsColliding(candidate, placedItem));
  const riseAlongAxis = (item: T) => {
    while (item[axis] > 0 && !checkIsBlocked({ ...item, [axis]: item[axis] - 1 })) item[axis] -= 1;
  };
  const pushAlongAxis = (item: T) => {
    if (isHorizontal && item.x + item.w + 1 > columnNumber) {
      item.x = columnNumber - item.w;
      item.y += 1;
    } else item[axis] += 1;
  };
  const sortedItems = copies.toSorted(
    (firstItem, secondItem) => firstItem[axis] - secondItem[axis] || firstItem[crossAxis] - secondItem[crossAxis],
  );
  for (const item of sortedItems) {
    if (compactType !== CompactType.None) riseAlongAxis(item);
    while (checkIsBlocked(item)) pushAlongAxis(item);
    placedItems.push(item);
  }
  return placedItems;
};
