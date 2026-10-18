import type { OfferingLevel } from "#src/models/offering/OfferingLevel";

// An offering's progress as the world holds it: the count held of each item toward its next level, by the item's id, the
// Level it has reached, and its levels, each taking its items off the held counts as it is reached
export interface OfferingProgress<TLevel extends OfferingLevel> {
  heldCounts: Readonly<Record<string, number>>;
  level: number;
  levels: TLevel[];
}
