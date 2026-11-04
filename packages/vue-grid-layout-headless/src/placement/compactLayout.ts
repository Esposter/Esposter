import type { GridBlock } from "#src/models/GridBlock";

import { CompactType } from "#src/models/CompactType";
import { checkIsColliding } from "#src/placement/checkIsColliding";

// Each item rises along the compaction axis as far as it can, in order along it, until it touches another or the
// Edge. A horizontal compaction that would push an item past the last column moves it down a row and as far back
// Along that row as it can go. One that starts inside another is pushed along the axis until it clears, so a
// Compacted layout never overlaps. A layout with no compaction keeps each item where it was placed, and still pushes an
// Overlapping one down until it clears. A solid item never rises, and is placed first, so the others compact around it
export const compactLayout = <T extends GridBlock>(
  layout: T[],
  columnNumber: number,
  compactType: CompactType,
  solidIds: ReadonlySet<GridBlock["id"]> = new Set(),
): T[] => {
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
      riseAlongAxis(item);
    } else item[axis] += 1;
  };
  const sortedItems = copies.toSorted(
    (firstItem, secondItem) => firstItem[axis] - secondItem[axis] || firstItem[crossAxis] - secondItem[crossAxis],
  );
  const placementOrder = [
    ...sortedItems.filter((item) => solidIds.has(item.id)),
    ...sortedItems.filter((item) => !solidIds.has(item.id)),
  ];
  for (const item of placementOrder) {
    if (compactType !== CompactType.None && !solidIds.has(item.id)) riseAlongAxis(item);
    while (checkIsBlocked(item)) pushAlongAxis(item);
    placedItems.push(item);
  }
  return sortedItems;
};
