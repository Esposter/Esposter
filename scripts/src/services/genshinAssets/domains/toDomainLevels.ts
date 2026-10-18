import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { ExcelDungeonRow } from "#src/models/genshinAssets/domains/ExcelDungeonRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";
import type { DomainLevel, DomainSchedule, ItemCount } from "genshin-world";

import {
  ALL_DAYS_OF_WEEK,
  DOMAIN_DAY_PAIRS,
  DOMAIN_LEVEL_TYPE,
  DUNGEON_TABLE_NAME,
  DungeonEntryTypeDomainKindMap,
  REWARD_PREVIEW_TABLE_NAME,
} from "#src/services/genshinAssets/domains/constants";
import { REWARD_COUNT_DEFAULT } from "#src/services/genshinAssets/rewards/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { DomainKind } from "genshin-world";

const getDungeon = (dungeonMap: ReadonlyMap<number, ExcelDungeonRow>, dungeonId: number): ExcelDungeonRow => {
  const dungeon = dungeonMap.get(dungeonId);
  if (dungeon === undefined || dungeon.type !== DOMAIN_LEVEL_TYPE)
    throw new InvalidOperationError(Operation.Read, DUNGEON_TABLE_NAME, `has no domain level ${dungeonId}`);
  return dungeon;
};

// A level's tree rewards are the items its reward preview gives a whole number of. An item with no count, or with a count
// That is fractional or a range, is a drop that is rolled, which an item count cannot hold, so it is left out. An empty
// Slot has no count
const toTreeRewards = (
  previewMap: ReadonlyMap<number, ExcelRewardPreviewRow>,
  { passRewardPreviewID }: ExcelDungeonRow,
): ItemCount[] => {
  const preview = previewMap.get(passRewardPreviewID);
  if (preview === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      REWARD_PREVIEW_TABLE_NAME,
      `has no reward preview ${passRewardPreviewID}`,
    );
  return preview.previewItems.flatMap(({ count = REWARD_COUNT_DEFAULT, id }) => {
    const itemCount = Number(count);
    return Number.isInteger(itemCount) && itemCount > 0 ? [{ count: itemCount, id }] : [];
  });
};

const toDomainLevel = (
  dungeon: ExcelDungeonRow,
  scheduledDaysOfWeek: readonly number[],
  previewMap: ReadonlyMap<number, ExcelRewardPreviewRow>,
): DomainLevel => ({
  dungeonId: dungeon.id,
  enemyLevel: dungeon.levelRevise,
  recommendedRank: dungeon.limitLevel,
  resinCost: dungeon.statueCostCount,
  scheduledDaysOfWeek: [...scheduledDaysOfWeek],
  treeRewards: toTreeRewards(previewMap, dungeon),
});

// A Domain of Blessing's levels are its entrance point's dungeons, which are open every day. A Domain of Forgery's or
// Mastery's level is a daily fight whose reward preview names its entry's materials: the day list holding one names the
// Pair of days it is set for, and the entry is the one that holds it. A daily fight naming two entries is refused rather
// Than guessed, and a daily fight no entry names is not a domain's. Each level also carries the resin its tree costs to
// Claim and the tree's rewards
export const toDomainLevels = (
  entries: ExcelDungeonEntryRow[],
  dungeons: ExcelDungeonRow[],
  previews: ExcelRewardPreviewRow[],
  points: Record<string, DumpedScenePoint>,
): Record<string, DomainSchedule> => {
  const dungeonMap = new Map(dungeons.map((dungeon) => [dungeon.id, dungeon]));
  const previewMap = new Map(previews.map((preview) => [preview.id, preview]));
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
      addLevel(
        entry.id,
        DomainKind.Blessing,
        toDomainLevel(getDungeon(dungeonMap, dungeonId), ALL_DAYS_OF_WEEK, previewMap),
      );
  }

  const familyEntries = entries.flatMap((entry) => {
    const kind = DungeonEntryTypeDomainKindMap[entry.type];
    return kind === undefined || kind === DomainKind.Blessing ? [] : [{ entry, kind }];
  });
  for (const dungeon of dungeons) {
    if (dungeon.type !== DOMAIN_LEVEL_TYPE) continue;
    const itemIds = previewMap.get(dungeon.passRewardPreviewID)?.previewItems.map(({ id }) => id) ?? [];
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
    addLevel(match.entry.id, match.kind, toDomainLevel(dungeon, scheduledDaysOfWeek, previewMap));
  }

  return Object.fromEntries(
    Array.from(schedules, ([entryId, { kind, levels }]): [string, DomainSchedule] => [
      String(entryId),
      { kind, levels: levels.toSorted((firstLevel, secondLevel) => firstLevel.dungeonId - secondLevel.dungeonId) },
    ]),
  );
};
