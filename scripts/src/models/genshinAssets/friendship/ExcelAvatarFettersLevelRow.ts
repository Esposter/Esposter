// One friendship level's row in the dump's AvatarFettersLevel table: the level it is, and the EXP it takes to go on from
// It to the next. The top level's row is the one level past the last, which nothing spends
export interface ExcelAvatarFettersLevelRow {
  fetterLevel: number;
  needExp: number;
}
