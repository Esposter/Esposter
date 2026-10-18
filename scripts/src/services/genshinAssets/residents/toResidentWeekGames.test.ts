import type { ExcelGcgWeekLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgWeekLevelRow";
import type { ExcelGcgWeekRewardRow } from "#src/models/genshinAssets/gcg/ExcelGcgWeekRewardRow";

import { toResidentWeekGames } from "#src/services/genshinAssets/residents/toResidentWeekGames";
import { describe, expect, test } from "vitest";

// The week reward rows of the dump at levels 1, 3, 5, 7 and 10, each with its Lucky Coins and Player EXP items
const WEEK_REWARD_ROWS: ExcelGcgWeekRewardRow[] = [
  {
    gcgLevel: 1,
    items: [
      { itemId: 107_021, NIEOALBMDMB: 600 },
      { itemId: 146, NIEOALBMDMB: 200 },
    ],
  },
  {
    gcgLevel: 3,
    items: [
      { itemId: 107_021, NIEOALBMDMB: 600 },
      { itemId: 146, NIEOALBMDMB: 200 },
    ],
  },
  {
    gcgLevel: 5,
    items: [
      { itemId: 107_021, NIEOALBMDMB: 900 },
      { itemId: 146, NIEOALBMDMB: 200 },
    ],
  },
  {
    gcgLevel: 7,
    items: [
      { itemId: 107_021, NIEOALBMDMB: 1200 },
      { itemId: 146, NIEOALBMDMB: 200 },
    ],
  },
  { gcgLevel: 10, items: [{ itemId: 107_021, NIEOALBMDMB: 1500 }] },
];

describe(toResidentWeekGames, () => {
  test("each level of an NPC's week row is a week game with its level's Lucky Coins and Player EXP", () => {
    expect.hasAssertions();

    const weekLevelRows: ExcelGcgWeekLevelRow[] = [
      {
        levelCondList: [
          { gcgLevel: 1, levelId: 1031 },
          { gcgLevel: 3, levelId: 1032 },
          { gcgLevel: 5, levelId: 1033 },
          { gcgLevel: 7, levelId: 1034 },
          { gcgLevel: 10, levelId: 1035 },
        ],
        npcId: 9704,
      },
    ];

    expect(toResidentWeekGames(weekLevelRows, WEEK_REWARD_ROWS, [9704])).toStrictEqual(
      new Map([
        [
          "9704",
          [
            { gameId: 1031, gcgLevel: 1, luckyCoins: 600, playerExp: 200 },
            { gameId: 1032, gcgLevel: 3, luckyCoins: 600, playerExp: 200 },
            { gameId: 1033, gcgLevel: 5, luckyCoins: 900, playerExp: 200 },
            { gameId: 1034, gcgLevel: 7, luckyCoins: 1200, playerExp: 200 },
            { gameId: 1035, gcgLevel: 10, luckyCoins: 1500, playerExp: 0 },
          ],
        ],
      ]),
    );
  });

  test("a level whose reward pays no Player EXP item gives its week game none", () => {
    expect.hasAssertions();

    const weekLevelRows: ExcelGcgWeekLevelRow[] = [{ levelCondList: [{ gcgLevel: 10, levelId: 1105 }], npcId: 9715 }];

    expect(toResidentWeekGames(weekLevelRows, WEEK_REWARD_ROWS, [9715]).get("9715")).toStrictEqual([
      { gameId: 1105, gcgLevel: 10, luckyCoins: 1500, playerExp: 0 },
    ]);
  });

  test("a week row of an NPC outside the listed NPCs offers no week game", () => {
    expect.hasAssertions();

    const weekLevelRows: ExcelGcgWeekLevelRow[] = [{ levelCondList: [{ gcgLevel: 1, levelId: 1051 }], npcId: 9706 }];

    expect(toResidentWeekGames(weekLevelRows, WEEK_REWARD_ROWS, [9704])).toStrictEqual(new Map());
  });

  test("a level with no reward row is refused rather than priced at zero", () => {
    expect.hasAssertions();

    const weekLevelRows: ExcelGcgWeekLevelRow[] = [{ levelCondList: [{ gcgLevel: 2, levelId: 1 }], npcId: 9704 }];

    expect(() => toResidentWeekGames(weekLevelRows, WEEK_REWARD_ROWS, [9704])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: week reward, the week reward table holds no row for level 2]`,
    );
  });
});
