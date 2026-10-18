import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toAdventureRankLevel } from "#src/services/genshinAssets/adventureRank/toAdventureRankLevel";
import { describe, expect, test } from "vitest";

const REWARD_ID = 200_002;
const MORA_ID = 202;
const rewardMap = new Map<number, ExcelRewardRow>([
  [
    REWARD_ID,
    {
      rewardId: REWARD_ID,
      rewardItemList: [
        { itemCount: 10_000, itemId: MORA_ID },
        { itemCount: 0, itemId: 0 },
        { itemCount: 3, itemId: 104_012 },
      ],
    },
  ],
]);

describe(toAdventureRankLevel, () => {
  test("a rank's reward is its reward row's items with the empty slots dropped", () => {
    expect.hasAssertions();
    expect(
      toAdventureRankLevel({ exp: 500, expeditionLimitAdd: 0, level: 2, rewardId: REWARD_ID }, rewardMap),
    ).toStrictEqual({
      exp: 500,
      level: 2,
      rewardItems: [
        { count: 10_000, itemId: MORA_ID },
        { count: 3, itemId: 104_012 },
      ],
    });
  });

  test("a rank with no reward id has no reward items", () => {
    expect.hasAssertions();
    expect(toAdventureRankLevel({ exp: 0, expeditionLimitAdd: 0, level: 1, rewardId: 0 }, rewardMap)).toStrictEqual({
      exp: 0,
      level: 1,
      rewardItems: [],
    });
  });
});
