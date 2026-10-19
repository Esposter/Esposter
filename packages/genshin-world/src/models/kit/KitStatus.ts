import type { KitNightsoulRate } from "#src/models/kit/KitNightsoulRate";
import type { KitSwapEndable } from "#src/models/kit/KitSwapEndable";

// A status a character carries for the seconds left of it, as gcsim's character statuses are: a passive's or a
// Constellation's own cooldown, or a mark a kit reads later. A second one of its id on the same character restarts it
export interface KitStatus extends KitSwapEndable {
  characterId: number;
  // The seconds the status has run past the seconds it started with, if a passive extends it up to a cap
  extendedSeconds?: number;
  id: string;
  kind: "status";
  // The Nightsoul points a Nightsoul's Blessing gains or drains each second it lasts, if it has any
  nightsoulRate?: KitNightsoulRate;
  secondsRemaining: number;
  // The count a kit keeps on the status as its hits strike or its heals land, if it counts them
  stacks?: number;
}
