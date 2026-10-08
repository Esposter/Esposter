import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";
import type { WorldDrop } from "#src/models/world/WorldDrop";

import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { ID_SEPARATOR } from "@esposter/shared";

// Where a defeated enemy's drops lie: its Mora as one pile when it dropped any, then each material piece as a drop of
// Its own. Every one lies at the enemy's ground point and is numbered from the drops the page has placed so far, so no
// Two drops of the page share an id
export const placeEnemyDrops = (
  { campId, id, position }: Pick<Enemy, "campId" | "id" | "position">,
  { materials, mora }: EnemyDrops,
  placedDropCount: number,
): WorldDrop[] => {
  const droppedItems: DroppedItem[] = [
    ...(mora > 0 ? [{ count: mora, itemId: MORA_ITEM_ID }] : []),
    ...materials.flatMap(({ count, itemId }) => Array.from({ length: count }, () => ({ count: 1, itemId }))),
  ];
  return droppedItems.map(({ count, itemId }, index) => ({
    count,
    id: [campId, id, placedDropCount + index].join(ID_SEPARATOR),
    itemId,
    position: { x: position.x, z: position.z },
  }));
};
