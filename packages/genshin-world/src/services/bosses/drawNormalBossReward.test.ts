import { NORMAL_BOSS_MORA, NORMAL_BOSS_UNIQUE_DROPS } from "#src/services/bosses/constants";
import { drawNormalBossReward } from "#src/services/bosses/drawNormalBossReward";
import { MORA_ITEM_ID } from "#src/services/inventory/constants";
import { takeOne } from "@esposter/shared";
import { describe, expect, test } from "vitest";

describe(drawNormalBossReward, () => {
  const UNIQUE_DROP_ID = 9001;
  const LOWEST_WORLD_LEVEL = 0;
  const HIGHER_WORLD_LEVEL = 4;

  test("a normal boss's claim pays Mora and its own drop for the World Level", () => {
    expect.hasAssertions();

    const lowestDrop = takeOne(NORMAL_BOSS_UNIQUE_DROPS, LOWEST_WORLD_LEVEL);
    const lowestMora = takeOne(NORMAL_BOSS_MORA, LOWEST_WORLD_LEVEL);

    expect(drawNormalBossReward(LOWEST_WORLD_LEVEL, UNIQUE_DROP_ID, () => 0.9)).toStrictEqual([
      { count: lowestMora, id: MORA_ITEM_ID },
      { count: lowestDrop.count, id: UNIQUE_DROP_ID },
    ]);
    expect(drawNormalBossReward(LOWEST_WORLD_LEVEL, UNIQUE_DROP_ID, () => 0.1)).toStrictEqual([
      { count: lowestMora, id: MORA_ITEM_ID },
      { count: lowestDrop.count + 1, id: UNIQUE_DROP_ID },
    ]);
    expect(drawNormalBossReward(HIGHER_WORLD_LEVEL, UNIQUE_DROP_ID, () => 0.9)).toStrictEqual([
      { count: takeOne(NORMAL_BOSS_MORA, HIGHER_WORLD_LEVEL), id: MORA_ITEM_ID },
      { count: takeOne(NORMAL_BOSS_UNIQUE_DROPS, HIGHER_WORLD_LEVEL).count, id: UNIQUE_DROP_ID },
    ]);
  });

  test("a World Level 9 claim pays what World Level 8 pays until its own row is read", () => {
    expect.hasAssertions();

    const highestWorldLevel = 9;
    const nextToHighestWorldLevel = 8;

    expect(drawNormalBossReward(highestWorldLevel, UNIQUE_DROP_ID, () => 0.1)).toStrictEqual(
      drawNormalBossReward(nextToHighestWorldLevel, UNIQUE_DROP_ID, () => 0.1),
    );
  });

  test("a World Level the game does not have is refused", () => {
    expect.hasAssertions();

    expect(() =>
      drawNormalBossReward(NORMAL_BOSS_MORA.length, UNIQUE_DROP_ID, () => 0.9),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: 10, has no normal boss reward row]`,
    );
  });
});
