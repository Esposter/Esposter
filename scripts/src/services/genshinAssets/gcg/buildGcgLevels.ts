import type { ExcelGcgLevelLockRow } from "#src/models/genshinAssets/gcg/ExcelGcgLevelLockRow";
import type { ExcelGcgLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgLevelRow";
import type { ExcelGcgWeekLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgWeekLevelRow";

import { toGcgLevels } from "#src/services/genshinAssets/gcg/toGcgLevels";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The card game's levels slice, read from the dump's level, week-level and level-lock tables: each Player Level's total EXP,
// each challenger's duels with the level that opens each, and the locks that hold the Player Level
export const buildGcgLevels = (): Record<string, unknown> => {
  const { challengerGames, playerLevelLocks, playerLevels } = toGcgLevels(
    readExcelTable<ExcelGcgLevelRow>("GCGLevelExcelConfigData"),
    readExcelTable<ExcelGcgWeekLevelRow>("GCGWeekLevelExcelConfigData"),
    readExcelTable<ExcelGcgLevelLockRow>("GCGLevelLockExcelConfigData"),
  );
  return { [`${GameDataset.Gcg}/levels`]: { challengerGames, playerLevelLocks, playerLevels } };
};
