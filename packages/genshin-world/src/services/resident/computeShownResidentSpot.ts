import type { ResidentSpot } from "#src/models/world/ResidentSpot";

// The spot a resident is shown at, given the spot they stand at and the spot the clock now gives them. A change of spot
// Waits while the resident is in view, so nobody is seen to jump at the turn of the hour, and an absence (undefined) is
// A spot too, so a resident leaving or arriving at the turn is held the same way
export const computeShownResidentSpot = (
  shownSpot: ResidentSpot | undefined,
  targetSpot: ResidentSpot | undefined,
  isInView: boolean,
): ResidentSpot | undefined => (shownSpot !== targetSpot && isInView ? shownSpot : targetSpot);
