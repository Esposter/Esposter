import type { ExcelRoleCombatDifficultyRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatDifficultyRow";
import { ExcelRoleCombatDifficultyRowFieldDumpKey } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatDifficultyRowFieldDumpKey";

// Each field of a difficulty row under the key the 7.1 dump holds it at, the scrambled keys named by their evidence
export const ExcelRoleCombatDifficultyRowFieldDumpKeyMap: Readonly<Record<keyof ExcelRoleCombatDifficultyRow, string>> =
  {
    [ExcelRoleCombatDifficultyRowFieldDumpKey.ActCount]: "GOMPDDJNDAE",
    [ExcelRoleCombatDifficultyRowFieldDumpKey.AlternateCastExtra]: "ADJGFDEJKFN",
    [ExcelRoleCombatDifficultyRowFieldDumpKey.AlternateCastMinimum]: "DKAOJONAPHB",
    [ExcelRoleCombatDifficultyRowFieldDumpKey.DifficultyId]: "difficultyId",
    [ExcelRoleCombatDifficultyRowFieldDumpKey.DifficultyLevel]: "difficultyLevel",
    [ExcelRoleCombatDifficultyRowFieldDumpKey.LevelFloor]: "OHDBPBMODLP",
  };
