import type { GridItem } from "#src/models/GridItem";

import { CollisionMode } from "#src/models/CollisionMode";
import { checkIsColliding } from "#src/placement/checkIsColliding";
import { moveItem } from "#src/placement/moveItem";

// The layout with the target moved onto its new cell, as the collision mode says. Push moves the items it lands on down.
// Swap trades places with the one item it lands on, and pushes when it lands on several. Prevent refuses a drop that
// Lands on any other item, so every item stays where it was
export const resolveMove = <T extends GridItem>(layout: T[], target: GridItem, collision: CollisionMode): T[] => {
  const landedItems = layout.filter((item) => item.id !== target.id && checkIsColliding(target, item));
  const [landedItem] = landedItems;
  const movedItem = layout.find((item) => item.id === target.id);
  if (collision === CollisionMode.Prevent && landedItems.length > 0) return layout.map((item) => ({ ...item }));
  if (collision === CollisionMode.Swap && landedItems.length === 1 && landedItem && movedItem) {
    const swappedLayout = layout.map((item) =>
      item.id === landedItem.id ? { ...item, x: movedItem.x, y: movedItem.y } : { ...item },
    );
    return moveItem(swappedLayout, target);
  }

  return moveItem(layout, target);
};
