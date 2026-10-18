import type { GameDataPublication } from "#src/models/gameData/GameDataPublication";
import type { ExcelDungeonEntryRow } from "#src/models/genshinAssets/domains/ExcelDungeonEntryRow";
import type { ExcelDungeonRow } from "#src/models/genshinAssets/domains/ExcelDungeonRow";
import type { ExcelRewardPreviewRow } from "#src/models/genshinAssets/expeditions/ExcelRewardPreviewRow";
import type { MaterialRow } from "#src/models/genshinAssets/items/MaterialRow";

import {
  DUNGEON_ENTRY_TABLE_NAME,
  DUNGEON_TABLE_NAME,
  REWARD_PREVIEW_TABLE_NAME,
  WEEKLY_BOSS_DOMAINS_KEY,
} from "#src/services/genshinAssets/domains/constants";
import { readDomainEntrancePoints } from "#src/services/genshinAssets/domains/readDomainEntrancePoints";
import { toDomainLevels } from "#src/services/genshinAssets/domains/toDomainLevels";
import { toWeeklyBossDomains } from "#src/services/genshinAssets/domains/toWeeklyBossDomains";
import { MATERIAL_TABLE_NAME } from "#src/services/genshinAssets/items/constants";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// Every challenge domain's kind and levels, each domain by its entrance's entry id, as the index the domain screen reads
// One entrance at a time from. The levels come from the dungeon table, the reward previews and the entry table, and a
// Blessing domain's from its entrance point
export const buildDomainLevels = async (): Promise<{ notes: string[]; publication: GameDataPublication }> => {
  const points = await readDomainEntrancePoints();
  const entries = readExcelTable<ExcelDungeonEntryRow>(DUNGEON_ENTRY_TABLE_NAME);
  const dungeons = readExcelTable<ExcelDungeonRow>(DUNGEON_TABLE_NAME);
  const schedules = toDomainLevels(
    entries,
    dungeons,
    readExcelTable<ExcelRewardPreviewRow>(REWARD_PREVIEW_TABLE_NAME),
    points,
    readExcelTable<MaterialRow>(MATERIAL_TABLE_NAME),
  );
  const weeklyBosses = toWeeklyBossDomains(entries, dungeons);
  const levelCount = Object.values(schedules).reduce((count, { levels }) => count + levels.length, 0);
  const weeklyLevelCount = Object.values(weeklyBosses).reduce((count, { levels }) => count + levels.length, 0);
  return {
    notes: [
      `${Object.keys(schedules).length} domains, ${levelCount} levels`,
      `${Object.keys(weeklyBosses).length} weekly boss domains, ${weeklyLevelCount} levels`,
    ],
    publication: {
      indexes: { [GameDataset.Domains]: schedules },
      objects: { [WEEKLY_BOSS_DOMAINS_KEY]: weeklyBosses },
    },
  };
};
