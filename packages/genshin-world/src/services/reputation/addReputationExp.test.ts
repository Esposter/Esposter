import type { ReputationLevel } from "#src/models/reputation/ReputationLevel";

import { addReputationExp } from "#src/services/reputation/addReputationExp";
import { describe, expect, test } from "vitest";

describe(addReputationExp, () => {
  const REPUTATION_LEVELS: ReputationLevel[] = [
    { functionIds: [], goodsIds: [], level: 1, nextLevelExp: 10, requestGroupId: 1, reward: { exp: 0, items: [] } },
    { functionIds: [], goodsIds: [], level: 2, nextLevelExp: 20, requestGroupId: 1, reward: { exp: 0, items: [] } },
    { functionIds: [], goodsIds: [], level: 3, nextLevelExp: 0, requestGroupId: 1, reward: { exp: 0, items: [] } },
  ];

  test("should keep the EXP short of a level's requirement within that level", () => {
    expect.hasAssertions();

    expect(addReputationExp({ exp: 0, level: 1 }, 9, REPUTATION_LEVELS)).toStrictEqual({ exp: 9, level: 1 });
  });

  test("should level up at exactly a level's requirement, carrying the EXP beyond it", () => {
    expect.hasAssertions();

    expect(addReputationExp({ exp: 0, level: 1 }, 10, REPUTATION_LEVELS)).toStrictEqual({ exp: 0, level: 2 });
    expect(addReputationExp({ exp: 4, level: 1 }, 10, REPUTATION_LEVELS)).toStrictEqual({ exp: 4, level: 2 });
  });

  test("should carry the EXP through several levels, and hold a nation's last level at none", () => {
    expect.hasAssertions();

    expect(addReputationExp({ exp: 0, level: 1 }, 35, REPUTATION_LEVELS)).toStrictEqual({ exp: 0, level: 3 });
    expect(addReputationExp({ exp: 0, level: 3 }, 5, REPUTATION_LEVELS)).toStrictEqual({ exp: 0, level: 3 });
  });
});
