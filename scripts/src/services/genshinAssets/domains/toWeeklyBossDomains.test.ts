import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { ExcelDungeonRow } from "#src/models/genshinAssets/domains/ExcelDungeonRow";

import { WEEKLY_BOSS_DUNGEON_TYPE, WEEKLY_BOSS_ENTRY_IDS } from "#src/services/genshinAssets/domains/constants";
import { toWeeklyBossDomains } from "#src/services/genshinAssets/domains/toWeeklyBossDomains";
import { describe, expect, test } from "vitest";

const ENTRY_ID = WEEKLY_BOSS_ENTRY_IDS[0];
const FIRST_DUNGEON_ID = 91001;
const SECOND_DUNGEON_ID = 91002;

const toEntry = (cooldownTipsDungeonId: number[]): ExcelDungeonEntryRow => ({
  cooldownTipsDungeonId,
  descriptionCycleRewardList: [],
  dungeonEntryId: 1,
  id: ENTRY_ID,
  sceneId: 1,
  type: "DUNGEON_ENTRY_TYPE_TRIAL",
});

const toDungeon = (id: number, type: string): ExcelDungeonRow => ({
  id,
  levelRevise: 40,
  limitLevel: 25,
  passRewardPreviewID: 1,
  type,
});

describe(toWeeklyBossDomains, () => {
  test("a weekly boss's domain lists its boss dungeons as its levels, lowest dungeon first", () => {
    expect.hasAssertions();

    const dungeons = [
      { ...toDungeon(SECOND_DUNGEON_ID, WEEKLY_BOSS_DUNGEON_TYPE), levelRevise: 50, limitLevel: 30 },
      toDungeon(FIRST_DUNGEON_ID, WEEKLY_BOSS_DUNGEON_TYPE),
    ];

    expect(toWeeklyBossDomains([toEntry([SECOND_DUNGEON_ID, FIRST_DUNGEON_ID])], dungeons)).toStrictEqual({
      [String(ENTRY_ID)]: {
        levels: [
          { dungeonId: FIRST_DUNGEON_ID, enemyLevel: 40, recommendedRank: 25 },
          { dungeonId: SECOND_DUNGEON_ID, enemyLevel: 50, recommendedRank: 30 },
        ],
      },
    });
  });

  test("a weekly boss's level that is not a boss dungeon is refused rather than skipped", () => {
    expect.hasAssertions();

    expect(() =>
      toWeeklyBossDomains([toEntry([FIRST_DUNGEON_ID])], [toDungeon(FIRST_DUNGEON_ID, "DUNGEON_DAILY_FIGHT")]),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: DungeonExcelConfigData, has no weekly boss level 91001]`,
    );
  });

  test("a weekly boss's entry missing from the dump is refused", () => {
    expect.hasAssertions();

    expect(() => toWeeklyBossDomains([], [])).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: DungeonEntryExcelConfigData, has no weekly boss entry 1006]`,
    );
  });
});
