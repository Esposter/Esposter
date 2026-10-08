// The fields read off one row of the game's tower reward table: a floor's place, the reward group the row belongs to, its
// Three star milestones' rewards, and the first clear of each of its chambers in order
export interface ExcelTowerRewardRow {
  floor: number;
  rewardGroup: number;
  rewardId3Stars: number;
  rewardId6Stars: number;
  rewardId9Stars: number;
  rewardIdRoom: number[];
}
