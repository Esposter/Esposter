// One reward row of the game's reward table, the items it gives, a blank item entry meaning none
export interface ExcelFishRewardRow {
  rewardId: number;
  rewardItemList: { itemCount: number; itemId: number }[];
}
