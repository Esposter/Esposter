import type { Landmark } from "#src/models/world/Landmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { GameTextKey } from "genshin-text";

// The game's name for a jump landmark: a Teleport Waypoint or a Statue of The Seven, the two a jump lands at
export const computeJumpLandmarkTextKey = ({ kind }: Landmark): GameTextKey =>
  kind === LandmarkKind.TeleportWaypoint ? GameTextKey.TeleportWaypoint : GameTextKey.StatueOfTheSeven;
