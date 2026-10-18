import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { toQuestRewardItems } from "#src/services/genshinText/toQuestRewardItems";
import { describe, expect, test } from "vitest";

// Made-up reward rows and item ids, since no record is copied into a test
const REWARD_MAP = new Map<number, ExcelRewardRow>([
  [
    1,
    {
      rewardId: 1,
      rewardItemList: [
        { itemCount: 3, itemId: 900_001 },
        { itemCount: 0, itemId: 0 },
      ],
    },
  ],
  [2, { rewardId: 2, rewardItemList: [{ itemCount: 5, itemId: 900_002 }] }],
]);

describe(toQuestRewardItems, () => {
  test("a quest's reward rows pay their items in order, the empty slots left out", () => {
    expect.hasAssertions();
    expect(toQuestRewardItems([1, 2], REWARD_MAP)).toStrictEqual([
      { count: 3, itemId: 900_001 },
      { count: 5, itemId: 900_002 },
    ]);
  });

  test("a reward row the table lacks is an error", () => {
    expect.hasAssertions();
    expect(() => toQuestRewardItems([3], REWARD_MAP)).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: reward table, has no reward 3]`,
    );
  });
});
