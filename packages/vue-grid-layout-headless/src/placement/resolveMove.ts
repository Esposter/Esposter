import type { GridBlock } from "#src/models/GridBlock";

import { CollisionMode } from "#src/models/CollisionMode";
import { checkIsColliding } from "#src/placement/checkIsColliding";
import { checkIsSameCell } from "#src/placement/checkIsSameCell";
import { moveItem } from "#src/placement/moveItem";

// The layout with the target moved onto its new cell, as the collision mode says. Push moves the items it lands on down.
// Swap trades places with the one item a move lands on, and pushes when it lands on several, when the item resizes,
// Or when either item would stick out past the last column once they trade. Prevent refuses a landing on any other item,
// So there is no layout to return and the result is undefined. A solid item is never displaced, so a landing over one, or
// A push or swap that moves one, is refused under every mode, as prevent refuses one
export const resolveMove = <T extends GridBlock>(
  layout: T[],
  target: GridBlock,
  collision: CollisionMode,
  columnNumber: number,
  solidIds: ReadonlySet<GridBlock["id"]> = new Set(),
): T[] | undefined => {
  const landedItems = layout.filter((item) => item.id !== target.id && checkIsColliding(target, item));
  const [landedItem] = landedItems;
  const movedItem = layout.find((item) => item.id === target.id);
  if (collision === CollisionMode.Prevent && landedItems.length > 0) return undefined;
  if (landedItems.some((item) => solidIds.has(item.id))) return undefined;
  const isMove = movedItem !== undefined && movedItem.w === target.w && movedItem.h === target.h;
  const resolvedLayout =
    collision === CollisionMode.Swap &&
    isMove &&
    landedItems.length === 1 &&
    landedItem &&
    movedItem &&
    movedItem.x + landedItem.w <= columnNumber &&
    landedItem.x + movedItem.w <= columnNumber
      ? moveItem(
          layout.map((item) => (item.id === landedItem.id ? { ...item, x: movedItem.x, y: movedItem.y } : { ...item })),
          { ...target, x: landedItem.x, y: landedItem.y },
        )
      : moveItem(layout, target);
  const isDisplacingSolid = layout.some((item) => {
    const resolvedItem = resolvedLayout.find(({ id }) => id === item.id);
    return (
      solidIds.has(item.id) &&
      item.id !== target.id &&
      resolvedItem !== undefined &&
      !checkIsSameCell(resolvedItem, item)
    );
  });
  return isDisplacingSolid ? undefined : resolvedLayout;
};
