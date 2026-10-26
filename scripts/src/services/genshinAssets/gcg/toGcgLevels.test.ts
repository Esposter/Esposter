import type { ExcelGcgLevelLockRow } from "#src/models/genshinAssets/gcg/ExcelGcgLevelLockRow";
import type { ExcelGcgLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgLevelRow";
import type { ExcelGcgWeekLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgWeekLevelRow";

import { toGcgLevels } from "#src/services/genshinAssets/gcg/toGcgLevels";
import { describe, expect, test } from "vitest";

describe(toGcgLevels, () => {
  const LEVEL_ROWS: ExcelGcgLevelRow[] = [
    { exp: 750, level: 2, rewardId: 2 },
    { exp: 300, level: 1, rewardId: 1 },
    { exp: 950, level: 3, rewardId: 3 },
  ];
  const LEVEL_LOCK_ROWS: ExcelGcgLevelLockRow[] = [
    { levelId: 2, unlockLevel: 2, unlockMainQuestId: 2 },
    { levelId: 1, unlockLevel: 1, unlockMainQuestId: 1 },
  ];
  const WEEK_LEVEL_ROWS: ExcelGcgWeekLevelRow[] = [
    {
      levelCondList: [
        { gcgLevel: 1, levelId: 1021 },
        { gcgLevel: 3, levelId: 1022 },
      ],
      npcId: 9701,
    },
    { levelCondList: [], npcId: 9702 },
    {
      levelCondList: [
        { gcgLevel: 10, levelId: 1115 },
        { gcgLevel: 0, levelId: 0 },
        { gcgLevel: 0, levelId: 0 },
      ],
      npcId: 9716,
    },
  ];

  test("should total each level's EXP from level one, and name each challenger's duels by their level", () => {
    expect.hasAssertions();

    expect(toGcgLevels(LEVEL_ROWS, WEEK_LEVEL_ROWS, LEVEL_LOCK_ROWS)).toStrictEqual({
      challengerGames: {
        9701: [
          { gameId: 1021, level: 1 },
          { gameId: 1022, level: 3 },
        ],
        9716: [{ gameId: 1115, level: 10 }],
      },
      playerLevelLocks: [
        { unlockLevel: 1, unlockMainQuestId: "1" },
        { unlockLevel: 2, unlockMainQuestId: "2" },
      ],
      playerLevels: [
        { exp: 0, level: 1 },
        { exp: 300, level: 2 },
        { exp: 1050, level: 3 },
      ],
    });
  });
});
