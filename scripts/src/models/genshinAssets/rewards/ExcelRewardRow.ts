// One reward of the game's reward table: the items it pays, a slot of zero being no item
export interface ExcelRewardRow {
  rewardId: number;
  rewardItemList: { itemCount: number; itemId: number }[];
}
