import type { ExcelDungeonLevelEntityRow } from "#src/models/genshinAssets/domains/ExcelDungeonLevelEntityRow";
import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { ExcelDungeonRow } from "#src/models/genshinAssets/domains/ExcelDungeonRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";

import { toDomainLevels } from "#src/services/genshinAssets/domains/toDomainLevels";
import { checkIsDomainKindOpenOnDay, DomainKind, GAME_TIME_ZONE } from "genshin-world";
import { describe, expect, test } from "vitest";

const createEntry = (overrides: Partial<ExcelDungeonEntryRow>): ExcelDungeonEntryRow => ({
  cooldownTipsDungeonId: [],
  descriptionCycleRewardList: [],
  dungeonEntryId: 7,
  id: 10,
  sceneId: 3,
  type: "DUNGEN_ENTRY_TYPE_AVATAR_TALENT",
  ...overrides,
});
const createDungeon = (overrides: Partial<ExcelDungeonRow>): ExcelDungeonRow => ({
  id: 1001,
  levelConfigMap: { 1995: 100 },
  levelRevise: 37,
  limitLevel: 25,
  passRewardPreviewID: 20,
  statueCostCount: 20,
  subType: "DUNGEON_SUB_TALENT",
  type: "DUNGEON_DAILY_FIGHT",
  ...overrides,
});
const LEVEL_ENTITIES: ExcelDungeonLevelEntityRow[] = [{ id: 1995, levelConfigName: "LevelEntity_ElementAddHurt_Fire" }];
const createPreview = (id: number, itemIds: number[]): ExcelRewardPreviewRow => ({
  id,
  previewItems: itemIds.map((itemId) => ({ id: itemId })),
});
const createMaterial = (id: number, rankLevel: number): MaterialRow => ({
  foodQuality: "",
  id,
  itemUse: [],
  nameTextMapHash: 0,
  rank: 0,
  rankLevel,
  stackLimit: 0,
});

// Three day lists of a talent domain, in the order Monday and Thursday, Tuesday and Friday, Wednesday and Saturday, and
// Sunday's union of all three
const talentEntry = createEntry({ descriptionCycleRewardList: [[101], [102], [103], [101, 102, 103]] });
const blessingEntry = createEntry({ dungeonEntryId: 48, id: 1, type: "DUNGEN_ENTRY_TYPE_RELIQUARY" });
const blessingPoint: DumpedScenePoint = { $type: "NKJPPNFAEEF", dungeonIds: [1001] };
// The materials of the day lists above, a book's rarity being its place in its list
const materials = [
  createMaterial(101, 2),
  createMaterial(102, 3),
  createMaterial(103, 4),
  createMaterial(201, 2),
  createMaterial(202, 3),
  createMaterial(203, 4),
];
// A Domain of Blessing's artifacts at Adventure Rank 25, the row a level of rank 25 reads
const blessingArtifacts = [
  { chance: 0.414, guaranteedCount: 2, rarity: 2 },
  { chance: 0.686, guaranteedCount: 4, rarity: 3 },
];

describe(toDomainLevels, () => {
  test("a talent domain's level takes the days of the pair its book is set for", () => {
    expect.hasAssertions();

    expect(
      toDomainLevels([talentEntry], [createDungeon({})], [createPreview(20, [102])], {}, materials, LEVEL_ENTITIES),
    ).toStrictEqual({
      10: {
        artifactSetIds: [],
        kind: DomainKind.Mastery,
        levels: [
          {
            dungeonId: 1001,
            enemyLevel: 37,
            recommendedRank: 25,
            disorder: "LevelEntity_ElementAddHurt_Fire",
            resinCost: 20,
            scheduledDaysOfWeek: [2, 5],
            treeArtifacts: [],
            treeRewards: [],
          },
        ],
      },
    });
  });

  test("a talent domain's level pays its pair's book at the count its rarity has in its Adventure Rank's row", () => {
    expect.hasAssertions();

    // A level of rank 25 reads the Mastery row at 27, which counts only two-star books, so the three- and four-star books
    // Of the pair are not paid
    expect(
      toDomainLevels([talentEntry], [createDungeon({})], [createPreview(20, [101])], {}, materials, LEVEL_ENTITIES),
    ).toStrictEqual({
      10: {
        artifactSetIds: [],
        kind: DomainKind.Mastery,
        levels: [
          {
            dungeonId: 1001,
            enemyLevel: 37,
            recommendedRank: 25,
            disorder: "LevelEntity_ElementAddHurt_Fire",
            resinCost: 20,
            scheduledDaysOfWeek: [1, 4],
            treeArtifacts: [],
            treeRewards: [{ averageCount: 3.2, itemId: 101, maxCount: 4, minCount: 3 }],
          },
        ],
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
    expect(toDomainLevels([entry], [dungeon], [createPreview(21, [203])], {}, materials, LEVEL_ENTITIES)).toStrictEqual(
      {
        2: {
          artifactSetIds: [],
          kind: DomainKind.Forgery,
          levels: [
            {
              dungeonId: 2001,
              enemyLevel: 37,
              recommendedRank: 25,
              disorder: "LevelEntity_ElementAddHurt_Fire",
              resinCost: 20,
              scheduledDaysOfWeek: [3, 6],
              treeArtifacts: [],
              treeRewards: [],
            },
          ],
        },
      },
    );
  });

  test("a domain closed today is refused", () => {
    expect.hasAssertions();

    const schedules = toDomainLevels(
      [talentEntry],
      [createDungeon({})],
      [createPreview(20, [102])],
      {},
      materials,
      LEVEL_ENTITIES,
    );
    const epochDay = Temporal.Instant.fromEpochMilliseconds(0).toZonedDateTimeISO("UTC").toPlainDate();
    // The epoch fell on a Thursday, so four days after it is a Monday and five a Tuesday
    // Noon of each day in the game's time zone, a moment that falls on that game day
    const atNoon = (day: Temporal.PlainDate) =>
      day.toZonedDateTime({ plainTime: "12:00", timeZone: GAME_TIME_ZONE }).toInstant();
    const monday = atNoon(epochDay.add({ days: 4 }));
    const tuesday = atNoon(epochDay.add({ days: 5 }));
    for (const { kind, levels } of Object.values(schedules))
      for (const { scheduledDaysOfWeek } of levels) {
        expect(checkIsDomainKindOpenOnDay(kind, monday, scheduledDaysOfWeek)).toBe(false);
        expect(checkIsDomainKindOpenOnDay(kind, tuesday, scheduledDaysOfWeek)).toBe(true);
      }
  });

  test("a Blessing domain's levels are its entrance point's dungeons, open every day, with their Adventure Rank's artifacts", () => {
    expect.hasAssertions();

    const dungeon = createDungeon({ subType: "DUNGEON_SUB_RELIQUARY" });
    expect(
      toDomainLevels(
        [blessingEntry],
        [dungeon],
        [createPreview(20, [])],
        { 48: blessingPoint },
        materials,
        LEVEL_ENTITIES,
      ),
    ).toStrictEqual({
      1: {
        artifactSetIds: [],
        kind: DomainKind.Blessing,
        levels: [
          {
            dungeonId: 1001,
            enemyLevel: 37,
            recommendedRank: 25,
            disorder: "LevelEntity_ElementAddHurt_Fire",
            resinCost: 20,
            scheduledDaysOfWeek: [1, 2, 3, 4, 5, 6, 7],
            treeArtifacts: blessingArtifacts,
            treeRewards: [],
          },
        ],
      },
    });
  });

  test("a level's tree rewards skip the padding and read the counts as numbers", () => {
    expect.hasAssertions();

    const preview: ExcelRewardPreviewRow = {
      id: 20,
      previewItems: [{ count: "100", id: 102 }, { id: 0 }, { count: "15", id: 105 }, { id: 0 }],
    };
    const dungeon = createDungeon({ statueCostCount: 40 });
    expect(
      toDomainLevels([blessingEntry], [dungeon], [preview], { 48: blessingPoint }, materials, LEVEL_ENTITIES),
    ).toStrictEqual({
      1: {
        artifactSetIds: [],
        kind: DomainKind.Blessing,
        levels: [
          {
            dungeonId: 1001,
            enemyLevel: 37,
            recommendedRank: 25,
            disorder: "LevelEntity_ElementAddHurt_Fire",
            resinCost: 40,
            scheduledDaysOfWeek: [1, 2, 3, 4, 5, 6, 7],
            treeArtifacts: blessingArtifacts,
            treeRewards: [
              { itemId: 102, maxCount: 100, minCount: 100 },
              { itemId: 105, maxCount: 15, minCount: 15 },
            ],
          },
        ],
      },
    });
  });

  test("a level's tree rewards leave out the drops whose counts are missing, fractional or a range", () => {
    expect.hasAssertions();

    const preview: ExcelRewardPreviewRow = {
      id: 20,
      previewItems: [{ id: 101 }, { count: "2.2", id: 103 }, { count: "3;4", id: 104 }, { count: "3", id: 102 }],
    };
    expect(
      toDomainLevels([blessingEntry], [createDungeon({})], [preview], { 48: blessingPoint }, materials, LEVEL_ENTITIES),
    ).toStrictEqual({
      1: {
        artifactSetIds: [],
        kind: DomainKind.Blessing,
        levels: [
          {
            dungeonId: 1001,
            enemyLevel: 37,
            recommendedRank: 25,
            disorder: "LevelEntity_ElementAddHurt_Fire",
            resinCost: 20,
            scheduledDaysOfWeek: [1, 2, 3, 4, 5, 6, 7],
            treeArtifacts: blessingArtifacts,
            treeRewards: [{ itemId: 102, maxCount: 3, minCount: 3 }],
          },
        ],
      },
    });
  });

  test("a level with no reward preview is refused", () => {
    expect.hasAssertions();

    expect(() =>
      toDomainLevels([blessingEntry], [createDungeon({})], [], { 48: blessingPoint }, materials, LEVEL_ENTITIES),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: RewardPreviewExcelConfigData, has no reward preview 20]`,
    );
  });

  test("a level naming several days' materials is open on Sunday and pays its first weekday counterpart's book", () => {
    expect.hasAssertions();

    expect(
      toDomainLevels(
        [talentEntry],
        [createDungeon({})],
        [createPreview(20, [101, 102, 103])],
        {},
        materials,
        LEVEL_ENTITIES,
      ),
    ).toStrictEqual({
      10: {
        artifactSetIds: [],
        kind: DomainKind.Mastery,
        levels: [
          {
            dungeonId: 1001,
            enemyLevel: 37,
            recommendedRank: 25,
            disorder: "LevelEntity_ElementAddHurt_Fire",
            resinCost: 20,
            scheduledDaysOfWeek: [7],
            treeArtifacts: [],
            treeRewards: [{ averageCount: 3.2, itemId: 101, maxCount: 4, minCount: 3 }],
          },
        ],
      },
    });
  });

  test("a daily level no domain names is left out", () => {
    expect.hasAssertions();

    expect(
      toDomainLevels(
        [talentEntry],
        [createDungeon({ passRewardPreviewID: 30 })],
        [createPreview(30, [999])],
        {},
        materials,
        LEVEL_ENTITIES,
      ),
    ).toStrictEqual({});
  });

  test("a daily level two domains name is refused", () => {
    expect.hasAssertions();

    const otherEntry = createEntry({ descriptionCycleRewardList: [[102], [104], [105], [102, 104, 105]], id: 11 });
    expect(() =>
      toDomainLevels(
        [talentEntry, otherEntry],
        [createDungeon({})],
        [createPreview(20, [102])],
        {},
        materials,
        LEVEL_ENTITIES,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: DungeonExcelConfigData, names level 1001 in two domains]`,
    );
  });

  test("a level naming two ley line disorders is refused", () => {
    expect.hasAssertions();

    expect(() =>
      toDomainLevels(
        [talentEntry],
        [createDungeon({ levelConfigMap: { 1995: 100, 1996: 100 } })],
        [createPreview(20, [102])],
        {},
        materials,
        LEVEL_ENTITIES,
      ),
    ).toThrowErrorMatchingInlineSnapshot(
      `[InvalidOperationError: Invalid operation: Read, name: DungeonLevelEntityConfigData, names no single ley line disorder for level 1001]`,
    );
  });
});
