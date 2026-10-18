// One row of the game's reliquary decompose table, the Mystic Offering's recipe: how many artifacts of which star rank it
// Takes and the reward preview its strongbox is shown by. The row names no set, its reward preview's display item does
export interface ExcelReliquaryDecomposeRow {
  id: number;
  needReliquaryCount: number;
  needReliquaryRankLevel: number;
  rewardPreviewId: number;
}
