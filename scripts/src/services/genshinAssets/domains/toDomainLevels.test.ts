import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { ExcelDungeonRow } from "#src/models/genshinAssets/domains/ExcelDungeonRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";

import { toDomainLevels } from "#src/services/genshinAssets/domains/toDomainLevels";
import { checkIsDomainKindOpenOnDay, DomainKind } from "genshin-world";
import { describe, expect, test } from "vitest";

const createEntry = (overrides: Partial<ExcelDungeonEntryRow>): ExcelDungeonEntryRow => ({
  descriptionCycleRewardList: [],
  dungeonEntryId: 7,
  id: 10,
  sceneId: 3,
  type: "DUNGEN_ENTRY_TYPE_AVATAR_TALENT",
  ...overrides,
});
const createDungeon = (overrides: Partial<ExcelDungeonRow>): ExcelDungeonRow => ({
  id: 1001,
  levelRevise: 37,
  limitLevel: 25,
  passRewardPreviewID: 20,
  subType: "DUNGEON_SUB_TALENT",
  type: "DUNGEON_DAILY_FIGHT",
  ...overrides,
});
const createPreview = (id: number, itemIds: number[]): ExcelRewardPreviewRow => ({
  id,
  previewItems: itemIds.map((itemId) => ({ id: itemId })),
});
// Three day lists of a talent domain, in the order Monday and Thursday, Tuesday and Friday, Wednesday and Saturday, and
// Sunday's union of all three
const talentEntry = createEntry({ descriptionCycleRewardList: [[101], [102], [103], [101, 102, 103]] });

describe(toDomainLevels, () => {
  test("a talent domain's level takes the days of the pair its book is set for", () => {
    expect.hasAssertions();

    expect(toDomainLevels([talentEntry], [createDungeon({})], [createPreview(20, [102])], {})).toStrictEqual({
      10: {
        kind: DomainKind.Mastery,
        levels: [{ dungeonId: 1001, enemyLevel: 37, recommendedRank: 25, scheduledDaysOfWeek: [2, 5] }],
      },
    });
  });

  test("a weapon domain's level takes the days of the pair its material is set for", () => {
    expect.hasAssertions();

    const entry = createEntry({
      descriptionCycleRewardList: [[201], [202], [203], [201, 202, 203]],
      id: 2,
      type: "DUNGEN_ENTRY_TYPE_WEAPON_PROMOTE",
    });
    const dungeon = createDungeon({ id: 2001, passRewardPreviewID: 21, subType: "DUNGEON_SUB_WEAPON" });
    expect(toDomainLevels([entry], [dungeon], [createPreview(21, [203])], {})).toStrictEqual({
      2: {
        kind: DomainKind.Forgery,
        levels: [{ dungeonId: 2001, enemyLevel: 37, recommendedRank: 25, scheduledDaysOfWeek: [3, 6] }],
      },
    });
  });

  test("a domain closed today is refused", () => {
    expect.hasAssertions();

    const schedules = toDomainLevels([talentEntry], [createDungeon({})], [createPreview(20, [102])], {});
    const epochDay = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC").toPlainDate();
    // The epoch fell on a Thursday, so four days after it is a Monday and five a Tuesday
    const monday = epochDay.add({ days: 4 });
    const tuesday = epochDay.add({ days: 5 });
    for (const { kind, levels } of Object.values(schedules))
      for (const { scheduledDaysOfWeek } of levels) {
        expect(checkIsDomainKindOpenOnDay(kind, monday, scheduledDaysOfWeek)).toBe(false);
        expect(checkIsDomainKindOpenOnDay(kind, tuesday, scheduledDaysOfWeek)).toBe(true);
      }
  });

  test("a Blessing domain's levels are its entrance point's dungeons and open every day", () => {
    expect.hasAssertions();

    const entry = createEntry({ dungeonEntryId: 48, id: 1, type: "DUNGEN_ENTRY_TYPE_RELIQUARY" });
    const point: DumpedScenePoint = { $type: "NKJPPNFAEEF", dungeonIds: [1001] };
    const dungeon = createDungeon({ subType: "DUNGEON_SUB_RELIQUARY" });
    expect(toDomainLevels([entry], [dungeon], [], { 48: point })).toStrictEqual({
      1: {
        kind: DomainKind.Blessing,
        levels: [{ dungeonId: 1001, enemyLevel: 37, recommendedRank: 25, scheduledDaysOfWeek: [1, 2, 3, 4, 5, 6, 7] }],
      },
    });
  });

  test("a level naming several days' materials is open on Sunday only", () => {
    expect.hasAssertions();

    expect(toDomainLevels([talentEntry], [createDungeon({})], [createPreview(20, [101, 102, 103])], {})).toStrictEqual({
      10: {
        kind: DomainKind.Mastery,
        levels: [{ dungeonId: 1001, enemyLevel: 37, recommendedRank: 25, scheduledDaysOfWeek: [] }],
      },
    });
  });

  test("a daily level no domain names is left out", () => {
    expect.hasAssertions();

    expect(
      toDomainLevels([talentEntry], [createDungeon({ passRewardPreviewID: 30 })], [createPreview(30, [999])], {}),
    ).toStrictEqual({});
  });

  test("a daily level two domains name is refused", () => {
    expect.hasAssertions();

    const otherEntry = createEntry({ descriptionCycleRewardList: [[102], [104], [105], [102, 104, 105]], id: 11 });
    expect(() =>
      toDomainLevels([talentEntry, otherEntry], [createDungeon({})], [createPreview(20, [102])], {}),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: DungeonExcelConfigData, names level 1001 in two domains]`,
    );
  });
});
