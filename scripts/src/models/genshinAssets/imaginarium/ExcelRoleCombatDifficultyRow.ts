// The fields read off one row of the game's Imaginarium Theater difficulty table: a difficulty's id, its level from one to
// Five, and the level a cast member must reach to take part at it
export interface ExcelRoleCombatDifficultyRow {
  BGKFIJLBDHC: number;
  difficultyId: number;
  difficultyLevel: number;
}
