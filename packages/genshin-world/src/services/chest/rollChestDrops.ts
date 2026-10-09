import type { ChestKind } from "#src/models/chest/ChestKind";
import type { DroppedItem } from "#src/models/enemy/DroppedItem";

import { ChestDropPoolMap } from "#src/services/chest/ChestDropPoolMap";
import { drawChestCount } from "#src/services/chest/drawChestCount";
import { takeOne } from "@esposter/shared";

// What one opening of a chest of a kind pours out: one weapon picked from its pool when the pool names any, and each
// Material's count rolled within its range, a material that rolls none left out. An artifact is not rolled here, since
// It needs its slot and rarity to be made, which a drop does not yet carry
export const rollChestDrops = (kind: ChestKind, random: () => number): DroppedItem[] => {
  const pool = ChestDropPoolMap[kind];
  if (!pool) return [];
  const weapons: DroppedItem[] =
    pool.weaponItemIds.length === 0
      ? []
      : [{ count: 1, itemId: takeOne(pool.weaponItemIds, Math.floor(random() * pool.weaponItemIds.length)) }];
  const materials = pool.materials.flatMap(({ count, itemId }) => {
    const drawnCount = drawChestCount(count, random);
    return drawnCount > 0 ? [{ count: drawnCount, itemId }] : [];
  });
  return [...weapons, ...materials];
};
