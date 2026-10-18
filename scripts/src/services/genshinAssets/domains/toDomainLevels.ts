import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { ExcelDungeonRow } from "#src/models/genshinAssets/domains/ExcelDungeonRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";
import type { DomainLevel, DomainSchedule } from "genshin-world";

import {
  ALL_DAYS_OF_WEEK,
  DOMAIN_DAY_PAIRS,
  DOMAIN_LEVEL_TYPE,
  DUNGEON_TABLE_NAME,
  DungeonEntryTypeDomainKindMap,
} from "#src/services/genshinAssets/domains/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { DomainKind } from "genshin-world";

const getDungeon = (dungeonMap: ReadonlyMap<number, ExcelDungeonRow>, dungeonId: number): ExcelDungeonRow => {
  const dungeon = dungeonMap.get(dungeonId);
  if (dungeon === undefined || dungeon.type !== DOMAIN_LEVEL_TYPE)
    throw new InvalidOperationError(Operation.Read, DUNGEON_TABLE_NAME, `has no domain level ${dungeonId}`);
  return dungeon;
};

const toDomainLevel = (dungeon: ExcelDungeonRow, scheduledDaysOfWeek: readonly number[]): DomainLevel => ({
  dungeonId: dungeon.id,
  enemyLevel: dungeon.levelRevise,
  recommendedRank: dungeon.limitLevel,
  scheduledDaysOfWeek: [...scheduledDaysOfWeek],
});

// A Domain of Blessing's levels are its entrance point's dungeons, which are open every day. A Domain of Forgery's or
// Mastery's level is a daily fight whose reward preview names its entry's materials: the day list holding one names the
// Pair of days it is set for, and the entry is the one that holds it. A daily fight naming two entries is refused rather
// Than guessed, and a daily fight no entry names is not a domain's
export const toDomainLevels = (
  entries: ExcelDungeonEntryRow[],
  dungeons: ExcelDungeonRow[],
  previews: ExcelRewardPreviewRow[],
  points: Record<string, DumpedScenePoint>,
): Record<string, DomainSchedule> => {
  const dungeonMap = new Map(dungeons.map((dungeon) => [dungeon.id, dungeon]));
  const itemIdsMap = new Map(previews.map(({ id, previewItems }) => [id, previewItems.map((item) => item.id)]));
  const schedules = new Map<number, DomainSchedule>();
  const addLevel = (entryId: number, kind: DomainKind, level: DomainLevel): void => {
    const schedule = schedules.get(entryId) ?? { kind, levels: [] };
    schedule.levels.push(level);
    schedules.set(entryId, schedule);
  };

  for (const entry of entries) {
    if (DungeonEntryTypeDomainKindMap[entry.type] !== DomainKind.Blessing) continue;
    const dungeonIds = points[String(entry.dungeonEntryId)]?.dungeonIds;
    for (const dungeonId of Array.isArray(dungeonIds) ? dungeonIds : [])
      addLevel(entry.id, DomainKind.Blessing, toDomainLevel(getDungeon(dungeonMap, dungeonId), ALL_DAYS_OF_WEEK));
  }

  const familyEntries = entries.flatMap((entry) => {
    const kind = DungeonEntryTypeDomainKindMap[entry.type];
    return kind === undefined || kind === DomainKind.Blessing ? [] : [{ entry, kind }];
  });
  for (const dungeon of dungeons) {
    if (dungeon.type !== DOMAIN_LEVEL_TYPE) continue;
    const itemIds = itemIdsMap.get(dungeon.passRewardPreviewID) ?? [];
    const matches = familyEntries.flatMap(({ entry, kind }) =>
      entry.descriptionCycleRewardList
        .slice(0, DOMAIN_DAY_PAIRS.length)
        .flatMap((dayList, pair) =>
          itemIds.some((itemId) => dayList.includes(itemId)) ? [{ entry, kind, pair }] : [],
        ),
    );
    const [match] = matches;
    if (match === undefined) continue;
    if (matches.some((other) => other.entry.id !== match.entry.id))
      throw new InvalidOperationError(Operation.Read, DUNGEON_TABLE_NAME, `names level ${dungeon.id} in two domains`);
    // A level naming one pair's material is open on that pair's days. One naming several pairs' materials is open on
    // Sunday only, the one day every material is open on
    const scheduledDaysOfWeek = matches.every((other) => other.pair === match.pair)
      ? (DOMAIN_DAY_PAIRS[match.pair] ?? [])
      : [];
    addLevel(match.entry.id, match.kind, toDomainLevel(dungeon, scheduledDaysOfWeek));
  }

  return Object.fromEntries(
    Array.from(schedules, ([entryId, { kind, levels }]): [string, DomainSchedule] => [
      String(entryId),
      { kind, levels: levels.toSorted((firstLevel, secondLevel) => firstLevel.dungeonId - secondLevel.dungeonId) },
    ]),
  );
};
