import type { PlaceLandmark } from "#src/models/world/PlaceLandmark";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { GameTextKey } from "genshin-text";

// The game's name for a jump landmark: a Domain Entrance's own title, a Teleport Waypoint's or a Statue of The Seven's, the
// Three a jump lands at. A Statue of the New Moon takes the Statue of The Seven's name, since the official map files the
// Nod-Krai statues under that label (`INTERACTIVE_MAP_STATUE_LABEL_ID`, area 13)
export const computeJumpLandmarkTextKey = (landmark: PlaceLandmark): GameTextKey => {
  if (landmark.kind === LandmarkKind.DomainEntrance) return landmark.titleTextKey;
  return landmark.kind === LandmarkKind.TeleportWaypoint ? GameTextKey.TeleportWaypoint : GameTextKey.StatueOfTheSeven;
};
