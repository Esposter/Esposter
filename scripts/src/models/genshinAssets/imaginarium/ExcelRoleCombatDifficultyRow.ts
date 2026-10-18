// The fields read off one row of the game's Imaginarium Theater difficulty table: a difficulty's id, its level from one to
// Five, and the character level a cast member must reach to take part at it. The dump scrambles most keys, so each is read
// Under the key the dump holds at 7.1, named here by its evidence. `levelFloor` is `OHDBPBMODLP`: 60 at levels one and two
// And 70 above, the wiki's minimum levels for Easy and Normal, then Hard and higher. `alternateCastMinimum` is
// `DKAOJONAPHB`: 2, 6, 10, 16 and 22 at levels one to five, six below the wiki's minimum members to start (8, 12, 16, 22 and
// 28), the six being the season's opening characters. `alternateCastExtra` is `ADJGFDEJKFN`: 2, 2, 4, 4 and 4, the wiki's
// Maximum less its minimum at each level (absent on the rows of the first seasons). `actCount` is `GOMPDDJNDAE`: 3, 6, 8,
// 10 and 10, the acts a difficulty runs: the wiki names Easy's three acts in 26 of its 29 seasons and Normal's six in 21, and
// The other three are read, not labelled per act
export interface ExcelRoleCombatDifficultyRow {
  actCount: number;
  alternateCastExtra?: number;
  alternateCastMinimum: number;
  difficultyId: number;
  difficultyLevel: number;
  levelFloor: number;
}
