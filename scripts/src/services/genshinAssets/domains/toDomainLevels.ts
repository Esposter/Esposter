import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { ExcelDungeonLevelEntityRow } from "#src/models/genshinAssets/domains/ExcelDungeonLevelEntityRow";
import type { ExcelDungeonRow } from "#src/models/genshinAssets/domains/ExcelDungeonRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/shared/ExcelRewardPreviewRow";
import type { DumpedScenePoint } from "#src/models/genshinAssets/world/DumpedScenePoint";
import type { DomainLevel, DomainSchedule } from "genshin-world";

import {
  BLESSING_TREE_ARTIFACT_ROWS,
  DOMAIN_DAY_PAIRS,
  DOMAIN_LEVEL_TYPE,
  DUNGEON_TABLE_NAME,
  DungeonEntryTypeDomainKindMap,
  SUNDAY_DAYS_OF_WEEK,
} from "#src/services/genshinAssets/domains/constants";
import { findTreeRow } from "#src/services/genshinAssets/domains/findTreeRow";
import { getDisorder } from "#src/services/genshinAssets/domains/getDisorder";
import { getDungeon } from "#src/services/genshinAssets/domains/getDungeon";
import { toBookRewards } from "#src/services/genshinAssets/domains/toBookRewards";
import { toDomainLevel } from "#src/services/genshinAssets/domains/toDomainLevel";
import { InvalidOperationError, Operation, takeOne } from "@esposter/shared";
import { ALL_DAYS_OF_WEEK, DomainKind } from "genshin-world";

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
  blessingArtifactSetIds: Readonly<Record<number, readonly number[]>>,
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
      artifactSetIds: kind === DomainKind.Blessing ? [...(blessingArtifactSetIds[entryId] ?? [])] : [],
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
    return kind === DomainKind.Forgery || kind === DomainKind.Mastery ? [{ entry, kind }] : [];
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
      takeOne(match.entry.descriptionCycleRewardList, counterpartPair),
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
