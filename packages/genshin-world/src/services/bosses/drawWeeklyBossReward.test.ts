import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { drawWeeklyBossReward } from "#src/services/bosses/drawWeeklyBossReward";
import { describe, expect, test } from "vitest";

// A random draw that always returns the value given, so each chance lands or misses as the value is set against it
const constantRandom = (value: number) => (): number => value;

describe(drawWeeklyBossReward, () => {
  const LOWEST_WORLD_LEVEL = 0;
  const DOMAIN_LEVEL_THREE_WORLD_LEVEL = 3;
  const HIGHEST_WORLD_LEVEL = 9;

  test("a claim at the lowest row pays its Mora, its gems, and the billet and Dream Solvent when their chances land", () => {
    expect.hasAssertions();

    expect(drawWeeklyBossReward(LOWEST_WORLD_LEVEL, constantRandom(0))).toStrictEqual([
      { count: 6375, id: MORA_ITEM_ID },
      { count: 1, id: 101101 },
      { count: 2, id: 104121 },
      { count: 1, id: 104122 },
      { count: 1, id: 113021 },
    ]);
  });

  test("a claim pays no billet or Dream Solvent when their chances miss, and rounds each gem's average up on a high roll", () => {
    expect.hasAssertions();

    expect(drawWeeklyBossReward(LOWEST_WORLD_LEVEL, constantRandom(0.99))).toStrictEqual([
      { count: 6375, id: MORA_ITEM_ID },
      { count: 3, id: 104151 },
      { count: 2, id: 104152 },
    ]);
  });

  test("domain Level III pays one talent material at its provisional chance, which the game's preview lists from III", () => {
    expect.hasAssertions();

    expect(drawWeeklyBossReward(DOMAIN_LEVEL_THREE_WORLD_LEVEL, constantRandom(0))).toStrictEqual([
      { count: 7100, id: MORA_ITEM_ID },
      { count: 1, id: 113003 },
      { count: 1, id: 101101 },
      { count: 2, id: 104121 },
      { count: 1, id: 104122 },
      { count: 1, id: 113021 },
    ]);
  });

  test("the highest row pays its guaranteed talent materials, one more on a chance that lands, and every gem tier", () => {
    expect.hasAssertions();

    expect(drawWeeklyBossReward(HIGHEST_WORLD_LEVEL, constantRandom(0.99))).toStrictEqual([
      { count: 8100, id: MORA_ITEM_ID },
      { count: 2, id: 113005 },
      { count: 4, id: 104151 },
      { count: 3, id: 104152 },
      { count: 1, id: 104153 },
      { count: 1, id: 104154 },
    ]);
  });
});
