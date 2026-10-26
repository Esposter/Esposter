import type { ExcelRoleCombatDifficultyRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatDifficultyRow";
import type { ImaginariumDifficulty } from "genshin-world";

// One difficulty from its table row: its id, its level, the level floor a cast member must reach, its acts, and its
// Alternate Cast beyond the six openers. An extra the row leaves out stays absent rather than reading as 0
export const toImaginariumDifficulty = (row: ExcelRoleCombatDifficultyRow): ImaginariumDifficulty => ({
  actCount: row.actCount,
  alternateCastExtra: row.alternateCastExtra,
  alternateCastMinimum: row.alternateCastMinimum,
  id: row.difficultyId,
  level: row.difficultyLevel,
  levelFloor: row.levelFloor,
});
