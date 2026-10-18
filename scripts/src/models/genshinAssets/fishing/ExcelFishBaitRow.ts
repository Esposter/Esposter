// One bait of the game's bait table: the item id it is held in the bag under, the feature tags it weights (a zero weight
// Names none), and the pools it names, which draw their fish in place of the tags
export interface ExcelFishBaitRow {
  featureList: { featureTag: number; weight: number }[];
  id: number;
  poolIdList: number[];
}
