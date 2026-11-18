import type { ExcelRoleCombatDifficultyRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatDifficultyRow";
import type { ImaginariumDifficulty } from "genshin-world";

// One difficulty from its table row: its id, its level, the level floor a cast member must reach, its acts, and its
// Alternate Cast beyond the six openers. The first seasons' rows leave the extra out at its protobuf default, 0, which
// Written back by `readExcelTable` from a sibling row that holds it, so they read 0; an extra no row holds stays absent
export const toImaginariumDifficulty = (row: ExcelRoleCombatDifficultyRow): ImaginariumDifficulty => ({
  actCount: row.actCount,
  alternateCastMinimum: row.alternateCastMinimum,
  id: row.difficultyId,
  level: row.difficultyLevel,
  levelFloor: row.levelFloor,
  ...(row.alternateCastExtra === undefined ? {} : { alternateCastExtra: row.alternateCastExtra }),
});
