import type { AdventureRankLevel } from "#src/models/adventureRank/AdventureRankLevel";
import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";

import { computeAdventureRankStanding } from "#src/services/adventureRank/computeAdventureRankStanding";
import { setAdventureRank } from "#src/services/dev/commands/setAdventureRank";
import { EMPTY_GENSHIN_SAVE } from "#src/services/save/constants";
import { describe, expect, test } from "vitest";

describe(setAdventureRank, () => {
  const RANK = 3;
  const EXP_AT_RANK = 300;
  const levels: AdventureRankLevel[] = [
    { exp: 100, level: 1, rewardItems: [] },
    { exp: 200, level: 2, rewardItems: [] },
    { exp: 300, level: 3, rewardItems: [] },
  ];
  const tables: AdventureRankTables = {
    levels,
    locks: [{ rankCap: 60, unlockMainQuestId: "", unlockPlayerLevel: 0, worldLevel: 0 }],
    worldLevelRows: [],
  };

  test("each writes the same save field the game's own act writes", () => {
    expect.hasAssertions();

    expect(setAdventureRank(EMPTY_GENSHIN_SAVE, { rank: RANK }, { adventureRankLevels: levels })).toStrictEqual({
      ok: true,
      save: { ...EMPTY_GENSHIN_SAVE, adventureExp: EXP_AT_RANK },
      value: RANK,
    });
    expect(computeAdventureRankStanding(tables, EXP_AT_RANK, new Set()).rank).toBe(RANK);
  });
});
