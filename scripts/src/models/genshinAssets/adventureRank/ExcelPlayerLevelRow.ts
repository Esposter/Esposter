// One rank of the game's player level table: the Adventure EXP that takes it to the next, the expeditions it adds to the
// Most that may be out at once, and the reward its rank pays, which a rank with none holds as zero
export interface ExcelPlayerLevelRow {
  exp: number;
  expeditionLimitAdd: number;
  level: number;
  rewardId: number;
}
