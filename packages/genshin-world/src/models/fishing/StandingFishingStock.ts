import type { FishingWeight } from "#src/models/fishing/FishingWeight";

// A stock of a region's pools that still holds fish at the hour it is read at: its key, and the weights it draws from
export interface StandingFishingStock {
  stockKey: string;
  weights: FishingWeight[];
}
