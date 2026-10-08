// One Adventure Rank band of the game's daily task level table: the ranks it spans, and the score preview that Katheryne's
// Daily bonus pays for it
export interface ExcelDailyTaskLevelRow {
  ID: number;
  maxPlayerLevel: number;
  minPlayerLevel: number;
  scorePreviewRewardId: number;
}
