// One level of an offering as the world reads it: the items it takes off the held count, the item they are, and the
// Rewards it pays. A level that names no item takes none
export interface OfferingLevelRow {
  itemCount: number;
  itemId: number;
  level: number;
  rewards: { itemCount: number; itemId: number }[];
}
