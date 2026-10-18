import type { ItemCount } from "#src/models/inventory/ItemCount";

import {
  WEEKLY_BOSS_BILLET_CHANCE,
  WEEKLY_BOSS_BILLET_ITEM_IDS,
  WEEKLY_BOSS_DREAM_SOLVENT_CHANCE,
  WEEKLY_BOSS_DREAM_SOLVENT_ITEM_ID,
  WEEKLY_BOSS_GEM_AVERAGES,
  WEEKLY_BOSS_GEM_ITEM_IDS,
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

// The item a draw of a list picks, one of its entries at random
const pickItemId = (itemIds: number[], random: () => number): number =>
  takeOne(itemIds, Math.floor(random() * itemIds.length));

// What a weekly boss's claim pays at a World Level: its Mora, a talent count of one of Dvalin's Plume, Claw and Sigh, one
// Northlander billet and one Dream Solvent where `random` falls under their chances, and each star tier's Ascension Gem at the
// Count its average rounds to at random. A row paying no talent material pays none, and no talent item is drawn
export const drawWeeklyBossReward = (worldLevel: number, random: () => number): ItemCount[] => {
  const row = computeWeeklyBossRow(worldLevel);
  const { chance, count } = takeOne(WEEKLY_BOSS_TALENT_DROPS, row);
  const talentCount = count + (random() < chance ? 1 : 0);
  const rewards: ItemCount[] = [{ count: takeOne(WEEKLY_BOSS_MORA, row), id: MORA_ITEM_ID }];
  if (talentCount > 0) rewards.push({ count: talentCount, id: pickItemId(WEEKLY_BOSS_TALENT_ITEM_IDS, random) });
  if (random() < WEEKLY_BOSS_BILLET_CHANCE)
    rewards.push({ count: 1, id: pickItemId(WEEKLY_BOSS_BILLET_ITEM_IDS, random) });
  for (const [tier, average] of takeOne(WEEKLY_BOSS_GEM_AVERAGES, row).entries()) {
    const gemCount = Math.floor(average + random());
    if (gemCount > 0)
      rewards.push({ count: gemCount, id: pickItemId(takeOne(WEEKLY_BOSS_GEM_ITEM_IDS, tier), random) });
  }
  if (random() < WEEKLY_BOSS_DREAM_SOLVENT_CHANCE) rewards.push({ count: 1, id: WEEKLY_BOSS_DREAM_SOLVENT_ITEM_ID });
  return rewards;
};
