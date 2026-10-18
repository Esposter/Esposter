import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ExcelReputationQuestRow } from "#src/models/genshinAssets/reputation/ExcelReputationQuestRow";

import { toReputationQuests } from "#src/services/genshinAssets/reputation/toReputationQuests";
import { describe, expect, test } from "vitest";

describe(toReputationQuests, () => {
  const REPUTATION_ITEM_ID = 1;
  const MORA_ITEM_ID = 202;
  const PARENT_QUEST_ID = 311;
  const REWARD_ID = 2_010_041;
  const REWARD_EXP = 40;
  const REWARD_MORA = 20_000;
  const row: ExcelReputationQuestRow = { cityId: 1, order: 101, parentQuestId: PARENT_QUEST_ID, rewardId: REWARD_ID };
  const rewardMap = new Map<number, ExcelRewardRow>([
    [
      REWARD_ID,
      {
        rewardId: REWARD_ID,
        rewardItemList: [
          { itemCount: REWARD_EXP, itemId: REPUTATION_ITEM_ID },
          { itemCount: REWARD_MORA, itemId: MORA_ITEM_ID },
        ],
      },
    ],
  ]);

  test("a reputation quest is bound to the quest its parent names, paying the reward it gives", () => {
    expect.hasAssertions();

    expect(toReputationQuests([row], rewardMap, REPUTATION_ITEM_ID)).toStrictEqual([
      { questId: PARENT_QUEST_ID, reward: { exp: REWARD_EXP, items: [{ count: REWARD_MORA, id: MORA_ITEM_ID }] } },
    ]);
  });
});
