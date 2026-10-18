// One Reputation quest of a nation: the quest its parent names, the reward it pays once that quest finishes, and its place
// In the list the game shows
export interface ExcelReputationQuestRow {
  cityId: number;
  order: number;
  parentQuestId: number;
  rewardId: number;
}
