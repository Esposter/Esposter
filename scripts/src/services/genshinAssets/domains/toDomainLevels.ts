import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { ExcelDungeonLevelEntityRow } from "#src/models/genshinAssets/domains/ExcelDungeonLevelEntityRow";
import type { ExcelDungeonRow } from "#src/models/genshinAssets/domains/ExcelDungeonRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";
import type { DomainLevel, DomainSchedule, RewardItem, TreeArtifact } from "genshin-world";

import {
  ALL_DAYS_OF_WEEK,
  DOMAIN_DAY_PAIRS,
  DOMAIN_LEVEL_TYPE,
  DUNGEON_LEVEL_ENTITY_TABLE_NAME,
  DUNGEON_TABLE_NAME,
  DungeonEntryTypeDomainKindMap,
  REWARD_PREVIEW_TABLE_NAME,
  SUNDAY_DAYS_OF_WEEK,
} from "#src/services/genshinAssets/domains/constants";
import {
  BLESSING_TREE_ARTIFACT_ROWS,
  BLESSING_ARTIFACT_SET_IDS,
  DOMAIN_TREE_COUNT_ROWS,
  findTreeRow,
} from "#src/services/genshinAssets/domains/treeRewardCounts";
import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/items/constants";
import { REWARD_COUNT_DEFAULT } from "#src/services/genshinAssets/rewards/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { DomainKind } from "genshin-world";

const getDungeon = (dungeonMap: ReadonlyMap<number, ExcelDungeonRow>, dungeonId: number): ExcelDungeonRow => {
  const dungeon = dungeonMap.get(dungeonId);
  if (dungeon === undefined || dungeon.type !== DOMAIN_LEVEL_TYPE)
    throw new InvalidOperationError(Operation.Read, DUNGEON_TABLE_NAME, `has no domain level ${dungeonId}`);
  return dungeon;
};

const getPreview = (
  previewMap: ReadonlyMap<number, ExcelRewardPreviewRow>,
  { passRewardPreviewID }: ExcelDungeonRow,
): ExcelRewardPreviewRow => {
  const preview = previewMap.get(passRewardPreviewID);
  if (preview === undefined)
    throw new InvalidOperationError(
      Operation.Read,
      REWARD_PREVIEW_TABLE_NAME,
      `has no reward preview ${passRewardPreviewID}`,
    );
  return preview;
};

// A level's whole rewards are the items its reward preview gives a whole number of, as Mora, Adventure EXP and Companionship
// EXP are. An item with no count, or with a count that is fractional or a range, is a drawn item, which its books, weapon
// Materials or artifacts give instead, so it is left out here. An empty slot has no count
const toWholeRewards = (preview: ExcelRewardPreviewRow): RewardItem[] =>
  preview.previewItems.flatMap(({ count = REWARD_COUNT_DEFAULT, id }) => {
    const itemCount = Number(count);
    return Number.isInteger(itemCount) && itemCount > 0
      ? [{ itemId: id, maxCount: itemCount, minCount: itemCount }]
      : [];
  });

// A Domain of Forgery's or Mastery's level pays its pair's books, each drawn between the least and most its rarity has in
// The Adventure Rank's row and to that row's average. A rarity the row has no count for is not paid, and a book whose rarity
// The materials do not name is refused rather than paid at no rarity
const toBookRewards = (
  kind: DomainKind.Forgery | DomainKind.Mastery,
  books: number[],
  rarities: ReadonlyMap<number, number>,
  rank: number,
): RewardItem[] => {
  const { counts } = findTreeRow(DOMAIN_TREE_COUNT_ROWS[kind], rank);
  return books.flatMap((itemId) => {
    const rarity = rarities.get(itemId);
    if (rarity === undefined)
      throw new InvalidOperationError(Operation.Read, MATERIAL_TABLE_NAME, `has no material ${itemId}`);
    const range = counts[rarity];
    return range === undefined
      ? []
      : [{ averageCount: range.avg, itemId, maxCount: range.maxCount, minCount: range.minCount }];
  });
};

// A daily fight's ley line disorder is the one level config its dungeon row names, read through the entity table's config name
const getDisorder = (dungeon: ExcelDungeonRow, entityNames: ReadonlyMap<number, string>): string => {
  const entityIds = Object.keys(dungeon.levelConfigMap ?? {});
  const disorder = entityIds.length === 1 ? entityNames.get(Number(entityIds[0])) : undefined;
  if (!disorder)
    throw new InvalidOperationError(
      Operation.Read,
      DUNGEON_LEVEL_ENTITY_TABLE_NAME,
      `names no single ley line disorder for level ${dungeon.id}`,
    );
  return disorder;
};

const toDomainLevel = (
  dungeon: ExcelDungeonRow,
  scheduledDaysOfWeek: readonly number[],
  previewMap: ReadonlyMap<number, ExcelRewardPreviewRow>,
  bookRewards: RewardItem[],
  treeArtifacts: TreeArtifact[],
  disorder: string,
): DomainLevel => ({
  dungeonId: dungeon.id,
  disorder,
  enemyLevel: dungeon.levelRevise,
  recommendedRank: dungeon.limitLevel,
  resinCost: dungeon.statueCostCount,
  scheduledDaysOfWeek: [...scheduledDaysOfWeek],
  treeArtifacts,
  treeRewards: [...toWholeRewards(getPreview(previewMap, dungeon)), ...bookRewards],
});

// A Domain of Blessing's levels are its entrance point's dungeons, which are open every day. A Domain of Forgery's or
// Mastery's level is a daily fight whose reward preview names its entry's materials: the day list holding one names the
// Pair of days it is set for, and the entry is the one that holds it. A daily fight naming two entries is refused rather
// Than guessed, and a daily fight no entry names is not a domain's. Each level also carries the resin its tree costs to
// Claim, the tree's whole rewards, and its books or artifacts at the counts the wiki gives its Adventure Rank
export const toDomainLevels = (
  entries: ExcelDungeonEntryRow[],
  dungeons: ExcelDungeonRow[],
  previews: ExcelRewardPreviewRow[],
  points: Record<string, DumpedScenePoint>,
  materials: MaterialRow[],
  levelEntities: ExcelDungeonLevelEntityRow[],
): Record<string, DomainSchedule> => {
  const entityNames = new Map(
    levelEntities.flatMap(({ id, levelConfigName }) => (levelConfigName ? [[id, levelConfigName] as const] : [])),
  );
  const dungeonMap = new Map(dungeons.map((dungeon) => [dungeon.id, dungeon]));
  const previewMap = new Map(previews.map((preview) => [preview.id, preview]));
  const rarities = new Map(materials.map(({ id, rankLevel }) => [id, rankLevel]));
  const schedules = new Map<number, DomainSchedule>();
  const addLevel = (entryId: number, kind: DomainKind, level: DomainLevel): void => {
    const schedule = schedules.get(entryId) ?? {
      artifactSetIds: kind === DomainKind.Blessing ? (BLESSING_ARTIFACT_SET_IDS[entryId] ?? []) : [],
      kind,
      levels: [],
    };
    schedule.levels.push(level);
    schedules.set(entryId, schedule);
  };

  for (const entry of entries) {
    if (DungeonEntryTypeDomainKindMap[entry.type] !== DomainKind.Blessing) continue;
    const dungeonIds = points[String(entry.dungeonEntryId)]?.dungeonIds;
    for (const dungeonId of Array.isArray(dungeonIds) ? dungeonIds : []) {
      const dungeon = getDungeon(dungeonMap, dungeonId);
      addLevel(
        entry.id,
        DomainKind.Blessing,
        toDomainLevel(
          dungeon,
          ALL_DAYS_OF_WEEK,
          previewMap,
          [],
          findTreeRow(BLESSING_TREE_ARTIFACT_ROWS, dungeon.limitLevel).artifacts,
          getDisorder(dungeon, entityNames),
        ),
      );
    }
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
    // A level naming one pair's material is open on that pair's days and pays that pair's books. One naming several pairs'
    // Materials is a Sunday, which every stage is open on, and pays its weekday counterpart's books: the same tier's level on
    // The first of its pairs' days, since the counterparts' books differ only by pair (PROVISIONAL: the dump does not say which
    // Of them a Sunday claim gives)
    const isOnePair = matches.every((other) => other.pair === match.pair);
    const counterpartPair = Math.min(...matches.map(({ pair }) => pair));
    const scheduledDaysOfWeek = isOnePair ? (DOMAIN_DAY_PAIRS[match.pair] ?? []) : SUNDAY_DAYS_OF_WEEK;
    const bookRewards = toBookRewards(
      match.kind,
      match.entry.descriptionCycleRewardList[counterpartPair],
      rarities,
      dungeon.limitLevel,
    );
    addLevel(
      match.entry.id,
      match.kind,
      toDomainLevel(dungeon, scheduledDaysOfWeek, previewMap, bookRewards, [], getDisorder(dungeon, entityNames)),
    );
  }

  return Object.fromEntries(
    Array.from(schedules, ([entryId, { artifactSetIds, kind, levels }]): [string, DomainSchedule] => [
      String(entryId),
      {
        artifactSetIds,
        kind,
        levels: levels.toSorted((firstLevel, secondLevel) => firstLevel.dungeonId - secondLevel.dungeonId),
      },
    ]),
  );
};
