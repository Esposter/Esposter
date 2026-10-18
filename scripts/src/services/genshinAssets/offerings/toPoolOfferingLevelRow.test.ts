import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toPoolOfferingLevelRow } from "#src/services/genshinAssets/offerings/toPoolOfferingLevelRow";
import { describe, expect, test } from "vitest";

describe(toPoolOfferingLevelRow, () => {
  const ITEM_ID = 101;
  const ITEM_COUNT = 6;
  const LEVEL = 3;
  const FIRST_SET_REWARD_ID = 4001;
  const SECOND_SET_REWARD_ID = 4002;
  const SHARED_ITEM_ID = 201;
  const FIRST_SET_ITEM_ID = 301;
  const SECOND_SET_ITEM_ID = 302;

  test("a level that draws from a pool publishes every set the pool holds, in the order given", () => {
    expect.hasAssertions();

    const levelRow: ExcelOfferingLevelupRow = {
      consumeItemConfigVec: [{ count: ITEM_COUNT, id: ITEM_ID }, {}],
      level: LEVEL,
      offeringId: 6,
      rewardId: 0,
    };
    const rewardRows: ExcelRewardRow[] = [
      {
        rewardId: FIRST_SET_REWARD_ID,
        rewardItemList: [
          { itemCount: 2, itemId: SHARED_ITEM_ID },
          { itemCount: 5, itemId: FIRST_SET_ITEM_ID },
        ],
      },
      {
        rewardId: SECOND_SET_REWARD_ID,
        rewardItemList: [
          { itemCount: 2, itemId: SHARED_ITEM_ID },
          { itemCount: 0, itemId: 0 },
          { itemCount: 7, itemId: SECOND_SET_ITEM_ID },
        ],
      },
    ];

    expect(toPoolOfferingLevelRow(levelRow, rewardRows)).toStrictEqual({
      items: [{ itemCount: ITEM_COUNT, itemId: ITEM_ID }],
      level: LEVEL,
      reward: {
        kind: "pool",
        sets: [
          [
            { itemCount: 2, itemId: SHARED_ITEM_ID },
            { itemCount: 5, itemId: FIRST_SET_ITEM_ID },
          ],
          [
            { itemCount: 2, itemId: SHARED_ITEM_ID },
            { itemCount: 7, itemId: SECOND_SET_ITEM_ID },
          ],
        ],
      },
    });
  });
});
