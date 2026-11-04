import type { GridItem } from "#src/models/GridItem";

import { CollisionMode } from "#src/models/CollisionMode";
import { checkIsColliding } from "#src/placement/checkIsColliding";
import { moveItem } from "#src/placement/moveItem";

// The layout with the target moved onto its new cell, as the collision mode says. Push moves the items it lands on down.
// Swap trades places with the one item a move lands on, and pushes when it lands on several, when the item resizes,
// Or when either item would stick out past the last column once they trade.
// Prevent refuses a drop that lands on any other item, so every item stays where it was
export const resolveMove = <T extends GridItem>(
  layout: T[],
  target: GridItem,
  collision: CollisionMode,
  columnNumber: number,
): T[] => {
  const landedItems = layout.filter((item) => item.id !== target.id && checkIsColliding(target, item));
  const [landedItem] = landedItems;
  const movedItem = layout.find((item) => item.id === target.id);
  if (collision === CollisionMode.Prevent && landedItems.length > 0) return layout.map((item) => ({ ...item }));
  const isMove = movedItem !== undefined && movedItem.w === target.w && movedItem.h === target.h;
  if (
    collision === CollisionMode.Swap &&
    isMove &&
    landedItems.length === 1 &&
    landedItem &&
    movedItem &&
    movedItem.x + landedItem.w <= columnNumber &&
    landedItem.x + movedItem.w <= columnNumber
  ) {
    const swappedLayout = layout.map((item) =>
      item.id === landedItem.id ? { ...item, x: movedItem.x, y: movedItem.y } : { ...item },
    );
    return moveItem(swappedLayout, { ...target, x: landedItem.x, y: landedItem.y });
  }

  return moveItem(layout, target);
};
