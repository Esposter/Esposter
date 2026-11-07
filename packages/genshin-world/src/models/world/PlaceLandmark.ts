import type { Landmark } from "#src/models/world/Landmark";
import type { RockLandmark } from "#src/models/world/RockLandmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";

// A landmark a player visits, reads off the map or interacts with: every landmark but a rock, which is drawn in the world
// And walked round, and is never a place to jump to or to resonate with
export type PlaceLandmark = Exclude<Landmark, RockLandmark>;

export const checkIsPlaceLandmark = (landmark: Landmark): landmark is PlaceLandmark =>
  landmark.kind !== LandmarkKind.Rock;
