import type { Fish } from "genshin-world";

import { toFish } from "#src/services/genshinAssets/fishing/toFish";
import { describe, expect, test } from "vitest";

describe(toFish, () => {
  const MONSTER_ID = 28_040_201;
  const CATEGORY_TAG_ID = 1;

  test("a fish record keeps its monster id and category", () => {
    expect.hasAssertions();

    const row: Fish = {
      attractRange: 0,
      biteTimeout: 0,
      bonusDuration: [],
      bonusOffset: [],
      bonusSpeed: [],
      bonusWidth: 0,
      feelerTimes: [],
      fleeRange: 0,
      hp: 0,
      id: 0,
      itemId: 0,
      monsterId: MONSTER_ID,
      proficientId: 0,
      rewardId: 0,
      skillId: [],
    };

    expect(toFish(row, CATEGORY_TAG_ID)).toStrictEqual({ ...row, categoryTagId: CATEGORY_TAG_ID });
  });
});
