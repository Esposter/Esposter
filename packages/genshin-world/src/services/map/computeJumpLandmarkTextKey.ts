import type { Landmark } from "#src/models/world/Landmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { GameTextKey } from "genshin-text";

// The game's name for a jump landmark: a Teleport Waypoint, a Statue of The Seven or a Domain Entrance, the three a jump
// Lands at
export const computeJumpLandmarkTextKey = ({ kind }: Landmark): GameTextKey => {
  if (kind === LandmarkKind.DomainEntrance) return GameTextKey.DomainEntrance;
  return kind === LandmarkKind.TeleportWaypoint ? GameTextKey.TeleportWaypoint : GameTextKey.StatueOfTheSeven;
};
