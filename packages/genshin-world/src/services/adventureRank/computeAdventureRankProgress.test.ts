import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { computeAdventureRankProgress } from "#src/services/adventureRank/computeAdventureRankProgress";
import { MAX_ADVENTURE_RANK } from "#src/services/adventureRank/constants";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { describe, expect, test } from "vitest";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);

describe(computeAdventureRankProgress, () => {
  const rank = 2;
  const rankExp = computeAdventureExpAtRank(adventureRankTables.levels, rank);
  const nextRankExp = computeAdventureExpAtRank(adventureRankTables.levels, rank + 1);

  test("the bar is empty at the EXP a rank is reached at", () => {
    expect.hasAssertions();

    expect(computeAdventureRankProgress(adventureRankTables, rankExp, rank)).toBe(0);
  });

  test("the bar fills toward the next rank's EXP", () => {
    expect.hasAssertions();

    expect(computeAdventureRankProgress(adventureRankTables, (rankExp + nextRankExp) / 2, rank)).toBe(0.5);
  });

  test("the bar is full where the EXP runs past the next rank, as a rank held by a quest shows", () => {
    expect.hasAssertions();

    expect(computeAdventureRankProgress(adventureRankTables, nextRankExp + 1, rank)).toBe(1);
  });

  test("the bar of the highest rank is full", () => {
    expect.hasAssertions();

    expect(computeAdventureRankProgress(adventureRankTables, 0, MAX_ADVENTURE_RANK)).toBe(1);
  });
});
