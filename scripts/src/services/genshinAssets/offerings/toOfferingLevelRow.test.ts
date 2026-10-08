import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toOfferingLevelRow } from "#src/services/genshinAssets/offerings/toOfferingLevelRow";
import { describe, expect, test } from "vitest";

describe(toOfferingLevelRow, () => {
  const FROSTBEARING_ITEM_ID = 107_010;
  const ITEMS_PER_LEVEL = 10;
  const LEVEL = 2;
  const REWARD_ID = 311_102;
  const MORA_ITEM_ID = 202;
  const MORA_COUNT = 50_000;
  const rewardRow: ExcelRewardRow = {
    rewardId: REWARD_ID,
    rewardItemList: [
      { itemCount: MORA_COUNT, itemId: MORA_ITEM_ID },
      { itemCount: 0, itemId: 0 },
    ],
  };

  test("should read the item and count a level takes, and its reward's items with the empty slots dropped", () => {
    expect.hasAssertions();

    const levelRow: ExcelOfferingLevelupRow = {
      consumeItemConfigVec: [{ count: ITEMS_PER_LEVEL, id: FROSTBEARING_ITEM_ID }, {}],
      level: LEVEL,
      offeringId: 1,
      rewardId: REWARD_ID,
    };

    expect(toOfferingLevelRow(levelRow, rewardRow)).toStrictEqual({
      itemCount: ITEMS_PER_LEVEL,
      itemId: FROSTBEARING_ITEM_ID,
      level: LEVEL,
      rewards: [{ itemCount: MORA_COUNT, itemId: MORA_ITEM_ID }],
    });
  });

  test("should take no item for a level that names none", () => {
    expect.hasAssertions();

    const levelRow: ExcelOfferingLevelupRow = {
      consumeItemConfigVec: [{}, {}],
      level: 1,
      offeringId: 1,
      rewardId: REWARD_ID,
    };

    expect(toOfferingLevelRow(levelRow, rewardRow)).toStrictEqual({
      itemCount: 0,
      itemId: 0,
      level: 1,
      rewards: [{ itemCount: MORA_COUNT, itemId: MORA_ITEM_ID }],
    });
  });
});
