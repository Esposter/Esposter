import type { ExcelOfferingLevelupRow } from "#src/models/genshinAssets/offerings/ExcelOfferingLevelupRow";
import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toOfferingLevelRow } from "#src/services/genshinAssets/offerings/toOfferingLevelRow";
import { toRewardItems } from "#src/services/genshinAssets/rewards/toRewardItems";
import { describe, expect, test } from "vitest";

describe(toOfferingLevelRow, () => {
  const ITEM_ID = 101;
  const ITEM_COUNT = 10;
  const OTHER_ITEM_ID = 102;
  const OTHER_ITEM_COUNT = 1;
  const LEVEL = 2;
  const REWARD_ID = 3001;
  const MORA_ITEM_ID = 201;
  const MORA_COUNT = 500;
  const rewardRow: ExcelRewardRow = {
    rewardId: REWARD_ID,
    rewardItemList: [
      { itemCount: MORA_COUNT, itemId: MORA_ITEM_ID },
      { itemCount: 0, itemId: 0 },
    ],
  };
  const fixedReward = { kind: "fixed", rewards: toRewardItems(rewardRow) } as const;

  test("a level's items publish as a list, each with its count, and its reward is the fixed one its row pays", () => {
    expect.hasAssertions();

    const levelRow: ExcelOfferingLevelupRow = {
      consumeItemConfigVec: [
        { count: ITEM_COUNT, id: ITEM_ID },
        { count: OTHER_ITEM_COUNT, id: OTHER_ITEM_ID },
      ],
      level: LEVEL,
      offeringId: 1,
      rewardId: REWARD_ID,
    };

    expect(toOfferingLevelRow(levelRow, fixedReward)).toStrictEqual({
      items: [
        { itemCount: ITEM_COUNT, itemId: ITEM_ID },
        { itemCount: OTHER_ITEM_COUNT, itemId: OTHER_ITEM_ID },
      ],
      level: LEVEL,
      reward: { kind: "fixed", rewards: [{ itemCount: MORA_COUNT, itemId: MORA_ITEM_ID }] },
    });
  });

  test("should read the item in the slot that names one, past the empty slot the dump writes back as zero", () => {
    expect.hasAssertions();

    const levelRow: ExcelOfferingLevelupRow = {
      consumeItemConfigVec: [
        { count: 0, id: 0 },
        { count: ITEM_COUNT, id: ITEM_ID },
      ],
      level: LEVEL,
      offeringId: 1,
      rewardId: REWARD_ID,
    };

    expect(toOfferingLevelRow(levelRow, fixedReward)).toStrictEqual({
      items: [{ itemCount: ITEM_COUNT, itemId: ITEM_ID }],
      level: LEVEL,
      reward: { kind: "fixed", rewards: [{ itemCount: MORA_COUNT, itemId: MORA_ITEM_ID }] },
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

    expect(toOfferingLevelRow(levelRow, fixedReward)).toStrictEqual({
      items: [],
      level: 1,
      reward: { kind: "fixed", rewards: [{ itemCount: MORA_COUNT, itemId: MORA_ITEM_ID }] },
    });
  });

  test("a level that draws from a pool publishes every set the pool holds, in the order given", () => {
    expect.hasAssertions();

    const SHARED_ITEM_ID = 201;
    const FIRST_SET_ITEM_ID = 301;
    const SECOND_SET_ITEM_ID = 302;
    const levelRow: ExcelOfferingLevelupRow = {
      consumeItemConfigVec: [{ count: ITEM_COUNT, id: ITEM_ID }, {}],
      level: LEVEL,
      offeringId: 6,
      rewardId: 0,
    };
    const poolRewardRows: ExcelRewardRow[] = [
      {
        rewardId: 4001,
        rewardItemList: [
          { itemCount: 2, itemId: SHARED_ITEM_ID },
          { itemCount: 5, itemId: FIRST_SET_ITEM_ID },
        ],
      },
      {
        rewardId: 4002,
        rewardItemList: [
          { itemCount: 2, itemId: SHARED_ITEM_ID },
          { itemCount: 0, itemId: 0 },
          { itemCount: 7, itemId: SECOND_SET_ITEM_ID },
        ],
      },
    ];

    expect(
      toOfferingLevelRow(levelRow, {
        kind: "pool",
        sets: poolRewardRows.map((poolRewardRow) => toRewardItems(poolRewardRow)),
      }),
    ).toStrictEqual({
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
