import type { KitNightsoulRate } from "#src/models/kit/KitNightsoulRate";

// A status a character carries for the seconds left of it, as gcsim's character statuses are: a passive's or a
// Constellation's own cooldown, or a mark a kit reads later. A second one of its id on the same character restarts it
export interface KitStatus {
  characterId: number;
  id: string;
  kind: "status";
  secondsRemaining: number;
  // The count a kit keeps on the status as its hits strike, if it counts them
  stacks?: number;
  // The Nightsoul points a Nightsoul's Blessing gains or drains each second it lasts, if it has any
  nightsoulRate?: KitNightsoulRate;
}
