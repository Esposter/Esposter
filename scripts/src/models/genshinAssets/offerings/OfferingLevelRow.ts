// One level of an offering as the world reads it: the items it takes off the held counts, each as its item and how many
// Of it, and the rewards it pays. A level that names no item takes none
export interface OfferingLevelRow {
  items: { itemCount: number; itemId: number }[];
  level: number;
  rewards: { itemCount: number; itemId: number }[];
}
