import type { ItemCount } from "#src/models/inventory/ItemCount";

import { NORMAL_BOSS_MORA, NORMAL_BOSS_UNIQUE_DROPS } from "#src/services/bosses/constants";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";

// What a normal boss's Trounce Blossom pays at a World Level: its Mora, and its own drop as its guaranteed count plus one
// More where `random` falls under its chance. A World Level with no row is refused rather than paid a neighbour's
export const drawNormalBossReward = (worldLevel: number, uniqueDropId: number, random: () => number): ItemCount[] => {
  if (worldLevel < 0 || worldLevel >= NORMAL_BOSS_MORA.length)
    throw new InvalidOperationError(Operation.Read, String(worldLevel), "has no normal boss reward row");
  const { chance, count } = takeOne(NORMAL_BOSS_UNIQUE_DROPS, worldLevel);
  return [
    { count: takeOne(NORMAL_BOSS_MORA, worldLevel), id: MORA_ITEM_ID },
    { count: count + (random() < chance ? 1 : 0), id: uniqueDropId },
  ];
};
