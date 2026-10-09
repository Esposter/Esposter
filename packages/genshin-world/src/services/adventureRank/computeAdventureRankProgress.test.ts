import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { computeAdventureRankProgress } from "#src/services/adventureRank/computeAdventureRankProgress";
import { MAX_ADVENTURE_RANK } from "#src/services/adventureRank/constants";
import { describe, expect, test } from "vitest";

describe(computeAdventureRankProgress, () => {
  const rank = 2;
  const rankExp = computeAdventureExpAtRank(rank);
  const nextRankExp = computeAdventureExpAtRank(rank + 1);

  test("the bar is empty at the EXP a rank is reached at", () => {
    expect.hasAssertions();

    expect(computeAdventureRankProgress(rankExp, rank)).toBe(0);
  });

  test("the bar fills toward the next rank's EXP", () => {
    expect.hasAssertions();

    expect(computeAdventureRankProgress((rankExp + nextRankExp) / 2, rank)).toBe(0.5);
  });

  test("the bar is full where the EXP runs past the next rank, as a rank held by a quest shows", () => {
    expect.hasAssertions();

    expect(computeAdventureRankProgress(nextRankExp + 1, rank)).toBe(1);
  });

  test("the bar of the highest rank is full", () => {
    expect.hasAssertions();

    expect(computeAdventureRankProgress(0, MAX_ADVENTURE_RANK)).toBe(1);
  });
});
