import type { ExcelAchievementRow } from "#src/models/genshinAssets/achievements/ExcelAchievementRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { PRIMOGEM_ITEM_ID } from "#src/services/genshinAssets/achievements/constants";
import { toAchievement } from "#src/services/genshinAssets/achievements/toAchievement";
import { describe, expect, test } from "vitest";

describe(toAchievement, () => {
  const REWARD_ID = 1;
  const PRIMOGEM_COUNT = 5;
  const OTHER_ITEM_ID = 210_021;
  const rewardMap = new Map<number, ExcelRewardRow>([
    [
      REWARD_ID,
      {
        rewardId: REWARD_ID,
        rewardItemList: [
          { itemCount: PRIMOGEM_COUNT, itemId: PRIMOGEM_ITEM_ID },
          { itemCount: 1, itemId: OTHER_ITEM_ID },
        ],
      },
    ],
  ]);
  const row: ExcelAchievementRow = {
    descTextMapHash: 2,
    finishRewardId: REWARD_ID,
    goalId: 3,
    id: 4,
    isDisuse: false,
    isShow: "SHOWTYPE_SHOW",
    orderId: 5,
    preStageAchievementId: 0,
    progress: 1,
    titleTextMapHash: 6,
    triggerConfig: { paramList: ["7010232,7519704", "", "", ""], triggerType: "TRIGGER_FINISH_QUEST_OR" },
  };

  test("should leave out an achievement the game no longer offers", () => {
    expect.hasAssertions();
    expect(toAchievement({ ...row, isDisuse: true }, rewardMap)).toBeUndefined();
  });

  test("should split an OR trigger's ids into parameters and pay only the Primogems of its reward", () => {
    expect.hasAssertions();
    expect(toAchievement(row, rewardMap)).toStrictEqual({
      categoryId: 3,
      descriptionTextId: "2",
      id: 4,
      isHidden: false,
      orderId: 5,
      preStageAchievementId: 0,
      primogems: PRIMOGEM_COUNT,
      progress: 1,
      titleTextId: "6",
      trigger: { parameters: ["7010232", "7519704"], type: "TRIGGER_FINISH_QUEST_OR" },
    });
  });
});
