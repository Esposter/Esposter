import type { Landmark } from "#src/models/world/Landmark";
import type { OfferingLandmark } from "#src/models/world/OfferingLandmark";
import type { RockLandmark } from "#src/models/world/RockLandmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";

// A landmark a player visits, reads off the map or interacts with: every landmark but a rock, which is drawn in the
// World And walked round, and an offering, which is offered to at its point and is never a place to jump to or to
// Resonate with
export type PlaceLandmark = Exclude<Landmark, OfferingLandmark | RockLandmark>;

export const checkIsPlaceLandmark = (landmark: Landmark): landmark is PlaceLandmark =>
  landmark.kind !== LandmarkKind.Offering && landmark.kind !== LandmarkKind.Rock;
