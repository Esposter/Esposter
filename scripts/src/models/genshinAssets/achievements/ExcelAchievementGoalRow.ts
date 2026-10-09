// The fields read off one row of the game's achievement category table: its id, its order, its name by text id and the
// Reward its completion pays, whose id is zero for a category with no end
export interface ExcelAchievementGoalRow {
  finishRewardId: number;
  id: number;
  nameTextMapHash: number;
  orderId: number;
}
