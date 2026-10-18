import type { ExcelGcgLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgLevelRow";
import type { ExcelGcgWeekLevelRow } from "#src/models/genshinAssets/gcg/ExcelGcgWeekLevelRow";

import { toGcgLevels } from "#src/services/genshinAssets/gcg/toGcgLevels";
import { readExcelTable } from "#src/services/genshinText/readExcelTable";
import { GameDataset } from "genshin-world";

// The card game's levels slice, read from the dump's level and week-level tables: each Player Level's total EXP, and each
// Challenger's duels with the level that opens each
export const buildGcgLevels = (): Record<string, unknown> => {
  const { challengerGames, playerLevels } = toGcgLevels(
    readExcelTable<ExcelGcgLevelRow>("GCGLevelExcelConfigData"),
    readExcelTable<ExcelGcgWeekLevelRow>("GCGWeekLevelExcelConfigData"),
  );
  return { [`${GameDataset.Gcg}/levels`]: { challengerGames, playerLevels } };
};
