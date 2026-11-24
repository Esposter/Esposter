import type { ExcelRoleCombatDifficultyRowFieldDumpKey } from "#src/models/genshinAssets/imaginarium/ExcelRoleCombatDifficultyRowFieldDumpKey";

// The fields read off one row of the game's Imaginarium Theater difficulty table: a difficulty's id, its level from one
// To five, and the character level a cast member must reach to take part at it. The dump scrambles most keys, so each
// Is read under the key the dump holds at 7.1, named here by its evidence. `levelFloor` is `OHDBPBMODLP`: 60 at levels
// One and two and 70 above, the wiki's minimum levels for Easy and Normal, then Hard and higher. `alternateCastMinimum`
// Is `DKAOJONAPHB`: 2, 6, 10, 16 and 22 at levels one to five, six below the wiki's minimum members to start (8, 12,
// 16, 22 and 28), the six being the season's opening characters. `alternateCastExtra` is `ADJGFDEJKFN`: 2, 2, 4, 4 and
// 4, the wiki's maximum less its minimum at each level, 0 on the first seasons' rows, which the dump leaves out at
// Its default. `actCount` is `GOMPDDJNDAE`: 3, 6, 8, 10 and 10, the acts a difficulty runs: the wiki names Easy's three
// Acts in 26 of its 29 seasons and Normal's six in 21, and the other three are read, not labelled per act
export interface ExcelRoleCombatDifficultyRow {
  [ExcelRoleCombatDifficultyRowFieldDumpKey.ActCount]: number;
  [ExcelRoleCombatDifficultyRowFieldDumpKey.AlternateCastExtra]?: number;
  [ExcelRoleCombatDifficultyRowFieldDumpKey.AlternateCastMinimum]: number;
  [ExcelRoleCombatDifficultyRowFieldDumpKey.DifficultyId]: number;
  [ExcelRoleCombatDifficultyRowFieldDumpKey.DifficultyLevel]: number;
  [ExcelRoleCombatDifficultyRowFieldDumpKey.LevelFloor]: number;
}
