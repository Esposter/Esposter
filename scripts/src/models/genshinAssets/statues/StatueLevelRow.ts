// One level of a region's statues as the world reads it: the Oculi it takes and their item, the rewards it pays, and the
// Stamina it adds to the maximum. A statue level takes one item, so it keeps its own flat shape rather than an offering's list
export interface StatueLevelRow {
  itemCount: number;
  itemId: number;
  level: number;
  rewards: { itemCount: number; itemId: number }[];
  staminaShare: number;
}
