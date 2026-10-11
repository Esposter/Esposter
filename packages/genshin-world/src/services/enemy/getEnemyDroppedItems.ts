import type { DroppedItem } from "#src/models/enemy/DroppedItem";
import type { EnemyDrops } from "#src/models/enemy/EnemyDrops";

import { MORA_ITEM_ID } from "#src/services/inventory/constants";

// The items a defeated enemy leaves lying: its Mora as one pile when it dropped any, then each material piece on its own
export const getEnemyDroppedItems = ({ materials, mora }: EnemyDrops): DroppedItem[] => [
  ...(mora > 0 ? [{ count: mora, itemId: MORA_ITEM_ID }] : []),
  ...materials.flatMap(({ count, itemId }) => Array.from({ length: count }, () => ({ count: 1, itemId }))),
];
