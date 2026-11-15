export const ExcelRoleCombatDifficultyRowFieldDumpKey = {
  ActCount: "actCount",
  AlternateCastExtra: "alternateCastExtra",
  AlternateCastMinimum: "alternateCastMinimum",
  DifficultyId: "difficultyId",
  DifficultyLevel: "difficultyLevel",
  LevelFloor: "levelFloor",
} as const;
export type ExcelRoleCombatDifficultyRowFieldDumpKey =
  (typeof ExcelRoleCombatDifficultyRowFieldDumpKey)[keyof typeof ExcelRoleCombatDifficultyRowFieldDumpKey];
