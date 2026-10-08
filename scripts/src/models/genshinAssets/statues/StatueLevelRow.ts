import type { OfferingLevelRow } from "#src/models/genshinAssets/offerings/OfferingLevelRow";

// One level of a region's statues as the world reads it: an offering level whose items are Oculi, and the stamina it
// Adds to the maximum
export interface StatueLevelRow extends OfferingLevelRow {
  staminaShare: number;
}
