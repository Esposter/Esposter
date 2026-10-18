import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import {
  WEEKLY_BOSS_DREAM_SOLVENT_ITEM_ID,
  WEEKLY_BOSS_MORA,
  WEEKLY_BOSS_TALENT_ITEM_IDS,
} from "#src/services/bosses/constants";
import { drawWeeklyBossReward } from "#src/services/bosses/drawWeeklyBossReward";
import { describe, expect, test } from "vitest";

const NO_CHANCE = (): number => 0.99;

describe(drawWeeklyBossReward, () => {
  const HIGHEST_WORLD_LEVEL = 9;
  const LOWEST_WORLD_LEVEL = 0;

  test("a weekly boss's claim pays its talent materials and Mora", () => {
    expect.hasAssertions();

    // The random draw picks the last talent item and lands no chance, so only the guaranteed talent count is paid
    expect(drawWeeklyBossReward(HIGHEST_WORLD_LEVEL, NO_CHANCE)).toStrictEqual([
      { count: WEEKLY_BOSS_MORA.at(-1), id: MORA_ITEM_ID },
      { count: 2, id: WEEKLY_BOSS_TALENT_ITEM_IDS.at(-1) },
    ]);
  });

  test("a claim at the lowest difficulty pays no talent material", () => {
    expect.hasAssertions();

    expect(drawWeeklyBossReward(LOWEST_WORLD_LEVEL, NO_CHANCE)).toStrictEqual([
      { count: WEEKLY_BOSS_MORA[0], id: MORA_ITEM_ID },
    ]);
  });

  test("a claim pays one Dream Solvent when its chance lands", () => {
    expect.hasAssertions();

    expect(drawWeeklyBossReward(LOWEST_WORLD_LEVEL, () => 0)).toStrictEqual([
      { count: WEEKLY_BOSS_MORA[0], id: MORA_ITEM_ID },
      { count: 1, id: WEEKLY_BOSS_DREAM_SOLVENT_ITEM_ID },
    ]);
  });
});
