import { GAME_DATA_LOCAL_BASE_URL } from "#scripts/gameData/constants";
import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { computeAdventureRankStanding } from "#src/services/adventureRank/computeAdventureRankStanding";
import { MAX_ADVENTURE_RANK } from "#src/services/adventureRank/constants";
import { readAdventureRankTables } from "#src/services/adventureRank/readAdventureRankTables";
import { describe, expect, test } from "vitest";

const adventureRankTables = await readAdventureRankTables(GAME_DATA_LOCAL_BASE_URL);

describe(computeAdventureRankStanding, () => {
  const noQuest = new Set<string>();
  const ascensionQuests = new Set(["25001", "25005", "25009", "25011"]);
  const maxAdventureExp = computeAdventureExpAtRank(adventureRankTables.levels, MAX_ADVENTURE_RANK);

  test("a new player is rank 1 at World Level 0, capped at 20", () => {
    expect.hasAssertions();

    expect(computeAdventureRankStanding(adventureRankTables, 0, noQuest)).toStrictEqual({
      rank: 1,
      rankCap: 20,
      worldLevel: 0,
    });
  });

  test("the rank holds at the first ascension quest, where its EXP runs on past 25 until the quest is done", () => {
    expect.hasAssertions();

    expect(computeAdventureRankStanding(adventureRankTables, maxAdventureExp, noQuest)).toStrictEqual({
      rank: 25,
      rankCap: 25,
      worldLevel: 1,
    });
    expect(computeAdventureRankStanding(adventureRankTables, maxAdventureExp, new Set(["25001"]))).toStrictEqual({
      rank: 35,
      rankCap: 35,
      worldLevel: 3,
    });
  });

  test("a finished chain of ascension quests lifts the rank to World Level 8's cap of 60", () => {
    expect.hasAssertions();

    expect(computeAdventureRankStanding(adventureRankTables, maxAdventureExp, ascensionQuests)).toStrictEqual({
      rank: 60,
      rankCap: 60,
      worldLevel: 8,
    });
  });
});
