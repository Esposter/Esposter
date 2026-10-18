import type { ExcelRoleCombatDifficultyRow } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatDifficultyRow";

// Each field of a difficulty row under the key the 7.1 dump holds it at, the scrambled keys named by their evidence
export const ExcelRoleCombatDifficultyRowFieldDumpKeyMap = {
  actCount: "GOMPDDJNDAE",
  alternateCastExtra: "ADJGFDEJKFN",
  alternateCastMinimum: "DKAOJONAPHB",
  difficultyId: "difficultyId",
  difficultyLevel: "difficultyLevel",
  levelFloor: "OHDBPBMODLP",
} as const satisfies Record<keyof ExcelRoleCombatDifficultyRow, string>;
