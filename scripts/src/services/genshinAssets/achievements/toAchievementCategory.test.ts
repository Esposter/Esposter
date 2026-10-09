import type { ExcelAchievementGoalRow } from "#src/models/genshinAssets/achievements/ExcelAchievementGoalRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toAchievementCategory } from "#src/services/genshinAssets/achievements/toAchievementCategory";
import { describe, expect, test } from "vitest";

describe(toAchievementCategory, () => {
  const REWARD_ID = 1;
  const NAMECARD_ITEM_ID = 210_021;
  const rewardMap = new Map<number, ExcelRewardRow>([
    [REWARD_ID, { rewardId: REWARD_ID, rewardItemList: [{ itemCount: 1, itemId: NAMECARD_ITEM_ID }] }],
  ]);
  const row: ExcelAchievementGoalRow = { finishRewardId: REWARD_ID, id: 2, nameTextMapHash: 3, orderId: 4 };

  test("should pay the namecard of a category with an end", () => {
    expect.hasAssertions();
    expect(toAchievementCategory(row, rewardMap)).toStrictEqual({
      id: 2,
      namecardItemId: NAMECARD_ITEM_ID,
      nameTextId: "3",
      orderId: 4,
    });
  });

  test("should pay no namecard for a category with no end", () => {
    expect.hasAssertions();
    expect(toAchievementCategory({ ...row, finishRewardId: 0 }, rewardMap).namecardItemId).toBe(0);
  });
});
