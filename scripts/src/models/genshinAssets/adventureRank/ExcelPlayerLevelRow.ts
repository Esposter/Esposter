// One rank of the game's player level table: the Adventure EXP that takes it to the next, the expeditions it adds to the
// Most that may be out at once, and the rank's own reward
export interface ExcelPlayerLevelRow {
  exp: number;
  expeditionLimitAdd: number;
  level: number;
}
