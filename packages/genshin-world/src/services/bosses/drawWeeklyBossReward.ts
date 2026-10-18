import type { ItemCount } from "#src/models/inventory/ItemCount";

import {
  WEEKLY_BOSS_DREAM_SOLVENT_CHANCE,
  WEEKLY_BOSS_DREAM_SOLVENT_ITEM_ID,
  WEEKLY_BOSS_MORA,
  WEEKLY_BOSS_TALENT_DROPS,
  WEEKLY_BOSS_TALENT_ITEM_IDS,
} from "#src/services/bosses/constants";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { takeOne } from "@esposter/shared";

// The row of a World Level: World Level 0 and 1 read Domain Level I, and each World Level above reads the next row, up to VI.
// Provisional, the wiki's rows being by Domain Level
const computeWeeklyBossRow = (worldLevel: number): number =>
  Math.min(Math.max(worldLevel, 1), WEEKLY_BOSS_MORA.length) - 1;

// What a weekly boss's claim pays at a World Level: its Mora, a talent count of one of Dvalin's Plume, Claw and Sigh, and one
// Dream Solvent where `random` falls under its chance. A row paying no talent material pays none, and no talent item is drawn
export const drawWeeklyBossReward = (worldLevel: number, random: () => number): ItemCount[] => {
  const row = computeWeeklyBossRow(worldLevel);
  const { chance, count } = takeOne(WEEKLY_BOSS_TALENT_DROPS, row);
  const talentCount = count + (random() < chance ? 1 : 0);
  const rewards: ItemCount[] = [{ count: takeOne(WEEKLY_BOSS_MORA, row), id: MORA_ITEM_ID }];
  if (talentCount > 0)
    rewards.push({
      count: talentCount,
      id: takeOne(WEEKLY_BOSS_TALENT_ITEM_IDS, Math.floor(random() * WEEKLY_BOSS_TALENT_ITEM_IDS.length)),
    });
  if (random() < WEEKLY_BOSS_DREAM_SOLVENT_CHANCE) rewards.push({ count: 1, id: WEEKLY_BOSS_DREAM_SOLVENT_ITEM_ID });
  return rewards;
};
