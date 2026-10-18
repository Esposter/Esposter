import type { OutcropKindRule } from "#src/models/leyLine/OutcropKindRule";

import { OutcropKind } from "#src/models/leyLine/OutcropKind";
import { computeOutcropClaimRewards } from "#src/services/leyLine/computeOutcropClaimRewards";
import { describe, expect, test } from "vitest";

describe(computeOutcropClaimRewards, () => {
  const ITEM_ID = 1;
  const REWARD_ROW_COUNT = 9;
  const rule: OutcropKindRule = {
    kind: OutcropKind.Wealth,
    playerLevel: 1,
    unlockCityIds: [],
    worldLevelRewards: Array.from({ length: REWARD_ROW_COUNT }, (_value, index) => [
      { itemId: ITEM_ID, maxCount: index + 1, minCount: index + 1 },
    ]),
  };

  test("world Level 0 claims the first reward row", () => {
    expect.hasAssertions();

    expect(computeOutcropClaimRewards(rule, 0)).toStrictEqual([{ itemId: ITEM_ID, maxCount: 1, minCount: 1 }]);
  });

  test("world Level 9 claims the last of nine rows", () => {
    expect.hasAssertions();

    expect(computeOutcropClaimRewards(rule, 9)).toStrictEqual([{ itemId: ITEM_ID, maxCount: 9, minCount: 9 }]);
  });
});
