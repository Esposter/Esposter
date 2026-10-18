import type { Landmark } from "#src/models/world/Landmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { GameTextKey } from "genshin-text";

// The game's name for a jump landmark: a Domain Entrance's own title, a Teleport Waypoint's or a Statue of The Seven's, the
// Three a jump lands at
export const computeJumpLandmarkTextKey = (landmark: Landmark): GameTextKey => {
  if (landmark.kind === LandmarkKind.DomainEntrance) return landmark.titleTextKey;
  return landmark.kind === LandmarkKind.TeleportWaypoint ? GameTextKey.TeleportWaypoint : GameTextKey.StatueOfTheSeven;
};
