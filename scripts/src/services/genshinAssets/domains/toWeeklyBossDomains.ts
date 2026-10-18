import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { ExcelDungeonRow } from "#src/models/genshinAssets/domains/ExcelDungeonRow";
import type { WeeklyBossDomain } from "#src/models/genshinAssets/domains/WeeklyBossDomain";

import {
  DUNGEON_ENTRY_TABLE_NAME,
  DUNGEON_TABLE_NAME,
  WEEKLY_BOSS_DUNGEON_TYPE,
  WEEKLY_BOSS_ENTRY_IDS,
} from "#src/services/genshinAssets/domains/constants";
import { InvalidOperationError, Operation } from "@esposter/shared";

// Each weekly boss's trounce domain by its entry id: its levels are the dungeons the entry names, each a boss dungeon with the
// Enemies' level and recommended rank it is set at. An entry missing from the dump, or a named dungeon that is not a boss
// Dungeon, is refused rather than skipped
export const toWeeklyBossDomains = (
  entries: ExcelDungeonEntryRow[],
  dungeons: ExcelDungeonRow[],
): Record<string, WeeklyBossDomain> => {
  const dungeonMap = new Map(dungeons.map((dungeon) => [dungeon.id, dungeon]));
  return Object.fromEntries(
    WEEKLY_BOSS_ENTRY_IDS.map((entryId) => {
      const entry = entries.find((row) => row.id === entryId);
      if (entry === undefined)
        throw new InvalidOperationError(
          Operation.Read,
          DUNGEON_ENTRY_TABLE_NAME,
          `has no weekly boss entry ${entryId}`,
        );
      const levels = entry.cooldownTipsDungeonId
        .map((dungeonId) => {
          const dungeon = dungeonMap.get(dungeonId);
          if (dungeon === undefined || dungeon.type !== WEEKLY_BOSS_DUNGEON_TYPE)
            throw new InvalidOperationError(
              Operation.Read,
              DUNGEON_TABLE_NAME,
              `has no weekly boss level ${dungeonId}`,
            );
          return { dungeonId, enemyLevel: dungeon.levelRevise, recommendedRank: dungeon.limitLevel };
        })
        .toSorted((firstLevel, secondLevel) => firstLevel.dungeonId - secondLevel.dungeonId);
      return [String(entryId), { levels }];
    }),
  );
};
