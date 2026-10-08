import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

// An offering's progress as the world holds it: the items held toward its next level, the level it has reached, and its
// Levels, each taking its items off the held count as it is reached
export interface OfferingProgress<TLevel extends OfferingLevel> {
  heldCount: number;
  level: number;
  levels: TLevel[];
}
