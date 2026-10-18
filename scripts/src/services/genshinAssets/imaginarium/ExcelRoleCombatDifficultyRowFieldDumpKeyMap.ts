import type { ExcelRoleCombatDifficultyRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatDifficultyRow";

// Each field of a difficulty row under the key the 7.1 dump holds it at, the scrambled keys named by their evidence
export const ExcelRoleCombatDifficultyRowFieldDumpKeyMap: Readonly<Record<keyof ExcelRoleCombatDifficultyRow, string>> =
  {
    actCount: "GOMPDDJNDAE",
    alternateCastExtra: "ADJGFDEJKFN",
    alternateCastMinimum: "DKAOJONAPHB",
    difficultyId: "difficultyId",
    difficultyLevel: "difficultyLevel",
    levelFloor: "OHDBPBMODLP",
  };
