// One Player Level of the card game's level table, as the dump names its plain fields: its number, the EXP that passes
// It to the next level, and the reward the level gives
export interface ExcelGcgLevelRow {
  exp: number;
  level: number;
  rewardId: number;
}
