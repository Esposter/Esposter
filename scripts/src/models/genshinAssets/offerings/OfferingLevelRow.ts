import type { OfferingItemCount } from "#src/models/genshinAssets/offerings/OfferingItemCount";
import type { OfferingLevelReward } from "#src/models/genshinAssets/offerings/OfferingLevelReward";

// One level of an offering as the world reads it: the items it takes off the held counts, each as its item and how many
// Of it, and what it pays. A level that names no item takes none
export interface OfferingLevelRow {
  items: OfferingItemCount[];
  level: number;
  reward: OfferingLevelReward;
}
