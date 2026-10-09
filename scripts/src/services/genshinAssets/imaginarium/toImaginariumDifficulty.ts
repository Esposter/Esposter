import type { ExcelRoleCombatDifficultyRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatDifficultyRow";
import type { ImaginariumDifficulty } from "genshin-world";

// One difficulty from its table row: its id, its level, and the level floor a cast member must reach
export const toImaginariumDifficulty = (row: ExcelRoleCombatDifficultyRow): ImaginariumDifficulty => ({
  id: row.difficultyId,
  level: row.difficultyLevel,
  levelFloor: row.BGKFIJLBDHC,
});
