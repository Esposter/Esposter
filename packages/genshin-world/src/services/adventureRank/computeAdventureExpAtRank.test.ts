import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { MAX_ADVENTURE_RANK } from "#src/services/adventureRank/constants";
import { describe, expect, test } from "vitest";

describe(computeAdventureExpAtRank, () => {
  test("rank 1 is reached at no EXP", () => {
    expect.hasAssertions();

    expect(computeAdventureExpAtRank(1)).toBe(0);
  });

  test("each rank is reached at the EXP of every rank below it, the game's table summed", () => {
    expect.hasAssertions();

    expect(computeAdventureExpAtRank(2)).toBe(375);
    expect(computeAdventureExpAtRank(25)).toBe(46_400);
  });

  test("the highest rank is reached at the total the game's table holds, which a held rank's EXP accrues up to", () => {
    expect.hasAssertions();

    expect(computeAdventureExpAtRank(MAX_ADVENTURE_RANK)).toBe(1_880_200);
  });
});
