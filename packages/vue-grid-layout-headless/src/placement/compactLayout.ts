import type { GridItem } from "#src/models/GridItem";

import { CompactType } from "#src/models/CompactType";
import { checkIsColliding } from "#src/placement/checkIsColliding";

// Each item rises along the compaction axis as far as it can, in order along it, until it touches another or the
// Edge. One that starts inside another is pushed along the axis until it clears, so a compacted layout never overlaps.
// A layout with no compaction keeps each item where it was placed
export const compactLayout = <T extends GridItem>(layout: T[], compactType: CompactType): T[] => {
  const copies = layout.map((item) => ({ ...item }));
  if (compactType === CompactType.None) return copies;

  const axis = compactType === CompactType.Vertical ? "y" : "x";
  const crossAxis = axis === "y" ? "x" : "y";
  const placedItems: T[] = [];
  const sortedItems = copies.toSorted(
    (firstItem, secondItem) => firstItem[axis] - secondItem[axis] || firstItem[crossAxis] - secondItem[crossAxis],
  );
  for (const item of sortedItems) {
    const checkIsBlocked = (candidate: T) => placedItems.some((placedItem) => checkIsColliding(candidate, placedItem));
    while (item[axis] > 0 && !checkIsBlocked({ ...item, [axis]: item[axis] - 1 })) item[axis] -= 1;
    while (checkIsBlocked(item)) item[axis] += 1;
    placedItems.push(item);
  }
  return placedItems;
};
