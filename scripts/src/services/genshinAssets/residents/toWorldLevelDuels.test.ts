import type { ExcelGcgWorldLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgWorldLevelRow";

import { toWorldLevelDuels } from "#src/services/genshinAssets/residents/toWorldLevelDuels";
import { describe, expect, test } from "vitest";

describe(toWorldLevelDuels, () => {
  test("an NPC with one world-level row is seated at that row's game and talk", () => {
    expect.hasAssertions();

    const rows: ExcelGcgWorldLevelRow[] = [{ levelId: 1, npcId: 2, talkId: 3 }];

    expect(toWorldLevelDuels(rows, [2])).toStrictEqual({
      duelMap: new Map([["2", { duelGameId: 1, duelTalkId: "3" }]]),
      twoRowNpcIds: [],
    });
  });

  test("an NPC with two world-level rows is left unseated and named", () => {
    expect.hasAssertions();

    const rows: ExcelGcgWorldLevelRow[] = [
      { levelId: 1, npcId: 2, talkId: 3 },
      { levelId: 4, npcId: 2, talkId: 5 },
    ];

    expect(toWorldLevelDuels(rows, [2])).toStrictEqual({ duelMap: new Map(), twoRowNpcIds: ["2"] });
  });

  test("an NPC with two world-level rows is named even when it is not listed", () => {
    expect.hasAssertions();

    const rows: ExcelGcgWorldLevelRow[] = [
      { levelId: 1, npcId: 2, talkId: 3 },
      { levelId: 4, npcId: 2, talkId: 5 },
    ];

    expect(toWorldLevelDuels(rows, [])).toStrictEqual({ duelMap: new Map(), twoRowNpcIds: ["2"] });
  });

  test("an NPC with one world-level row outside the listed NPCs is not seated", () => {
    expect.hasAssertions();

    const rows: ExcelGcgWorldLevelRow[] = [{ levelId: 1, npcId: 2, talkId: 3 }];

    expect(toWorldLevelDuels(rows, [4])).toStrictEqual({ duelMap: new Map(), twoRowNpcIds: [] });
  });
});
