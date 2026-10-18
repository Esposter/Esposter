import type { AdventureRankLevel } from "#src/models/adventureRank/AdventureRankLevel";

import { claimRankRewards } from "#src/services/adventureRank/claimRankRewards";
import { describe, expect, test } from "vitest";

const MORA_ID = 202;
const levels: AdventureRankLevel[] = [
  { exp: 0, level: 1, rewardItems: [] },
  { exp: 500, level: 2, rewardItems: [{ count: 10_000, itemId: MORA_ID }] },
  { exp: 1125, level: 3, rewardItems: [{ count: 3, itemId: 104_012 }] },
];

describe(claimRankRewards, () => {
  test("katheryne gives a reached rank's reward once", () => {
    expect.hasAssertions();
    const claim = claimRankRewards(levels, 3, []);
    expect(claim.rewards).toStrictEqual([
      { count: 10_000, itemId: MORA_ID },
      { count: 3, itemId: 104_012 },
    ]);
    expect(claim.claimedRanks).toStrictEqual([2, 3]);
  });

  test("katheryne gives nothing for a reward already claimed", () => {
    expect.hasAssertions();
    const claim = claimRankRewards(levels, 3, [2, 3]);
    expect(claim.rewards).toStrictEqual([]);
    expect(claim.claimedRanks).toStrictEqual([2, 3]);
  });
});
