// One level of an offering's level-up table: the items it takes, as the dump names each slot with an optional count and
// Id, and the reward row it pays. Level 1 names no item
export interface ExcelOfferingLevelupRow {
  consumeItemConfigVec: { count?: number; id?: number }[];
  level: number;
  offeringId: number;
  rewardId: number;
}
