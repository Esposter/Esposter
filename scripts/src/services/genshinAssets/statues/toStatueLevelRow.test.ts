import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";
import type { ExcelCityLevelupRow } from "#src/models/genshinAssets/statues/ExcelCityLevelupRow";

import { toStatueLevelRow } from "#src/services/genshinAssets/statues/toStatueLevelRow";
import { describe, expect, test } from "vitest";

describe(toStatueLevelRow, () => {
  const ANEMOCULUS_ITEM_ID = 107_001;
  const STAMINA_SHARE = 8;
  const ADVENTURE_EXP_ITEM_ID = 102;
  const ADVENTURE_EXP_COUNT = 160;
  const LEVEL = 4;
  const REWARD_ID = 210_314;
  const ZERO_REWARD_ITEM = { itemCount: 0, itemId: 0 };

  test("should read the Oculi a level takes, its stamina and its reward's items, dropping the empty slots", () => {
    expect.hasAssertions();

    const levelRow: ExcelCityLevelupRow = {
      actionVec: [
        { param1Vec: [], param2Vec: [], type: "WORLD_AREA_ACTION_NONE" },
        { param1Vec: [STAMINA_SHARE], param2Vec: [], type: "WORLD_AREA_ACTION_IMPROVE_STAMINA" },
      ],
      cityId: 1,
      consumeItem: { EBHHDLDJNHI: 4, itemId: ANEMOCULUS_ITEM_ID },
      level: LEVEL,
      rewardID: REWARD_ID,
      sceneId: 3,
    };
    const rewardRow: ExcelRewardRow = {
      rewardId: REWARD_ID,
      rewardItemList: [{ itemCount: ADVENTURE_EXP_COUNT, itemId: ADVENTURE_EXP_ITEM_ID }, ZERO_REWARD_ITEM],
    };

    expect(toStatueLevelRow(levelRow, rewardRow)).toStrictEqual({
      itemCount: 4,
      itemId: ANEMOCULUS_ITEM_ID,
      level: LEVEL,
      rewards: [{ itemCount: ADVENTURE_EXP_COUNT, itemId: ADVENTURE_EXP_ITEM_ID }],
      staminaShare: STAMINA_SHARE,
    });
  });

  test("should give no stamina to a level without an improve-stamina action", () => {
    expect.hasAssertions();

    const levelRow: ExcelCityLevelupRow = {
      actionVec: [{ param1Vec: [], param2Vec: [], type: "WORLD_AREA_ACTION_NONE" }],
      cityId: 1,
      consumeItem: { EBHHDLDJNHI: 0, itemId: 0 },
      level: 1,
      rewardID: REWARD_ID,
      sceneId: 3,
    };

    expect(toStatueLevelRow(levelRow, { rewardId: REWARD_ID, rewardItemList: [] }).staminaShare).toBe(0);
  });
});
