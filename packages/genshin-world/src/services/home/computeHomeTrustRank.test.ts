import type { HomeTrustLevel } from "#src/models/home/HomeTrustLevel";

import { computeHomeTrustRank } from "#src/services/home/computeHomeTrustRank";
import { describe, expect, test } from "vitest";

describe(computeHomeTrustRank, () => {
  const FIRST_RANK_EXP = 300;
  const SECOND_RANK_EXP = 600;
  const levels: HomeTrustLevel[] = [
    { bountyStoreLimit: 0, coinStoreLimit: 0, exp: FIRST_RANK_EXP, level: 1, npcCount: 1 },
    { bountyStoreLimit: 0, coinStoreLimit: 0, exp: SECOND_RANK_EXP, level: 2, npcCount: 2 },
    { bountyStoreLimit: 0, coinStoreLimit: 0, exp: 0, level: 3, npcCount: 3 },
  ];

  test("should read the first rank until the first rank's EXP is held, then the next", () => {
    expect.hasAssertions();

    expect(computeHomeTrustRank(FIRST_RANK_EXP - 1, levels)).toBe(1);
    expect(computeHomeTrustRank(FIRST_RANK_EXP, levels)).toBe(2);
  });

  test("should pass a rank only once every rank below it is held, not on its own EXP", () => {
    expect.hasAssertions();

    expect(computeHomeTrustRank(FIRST_RANK_EXP + SECOND_RANK_EXP - 1, levels)).toBe(2);
    expect(computeHomeTrustRank(FIRST_RANK_EXP + SECOND_RANK_EXP, levels)).toBe(3);
  });
});
