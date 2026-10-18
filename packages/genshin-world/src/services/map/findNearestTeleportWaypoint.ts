import type { Landmark } from "#src/models/world/Landmark";
import type { WaypointLandmark } from "#src/models/world/WaypointLandmark";
import type { GroundPoint } from "genshin-engine";

import { LandmarkKind } from "#src/models/world/LandmarkKind";
import { findNearestLandmark } from "#src/services/map/findNearestLandmark";

// The Teleport Waypoint standing nearest a point among the unlocked landmarks, where a fallen team revives, or none when no
// Waypoint is unlocked. A statue may stand nearer, but it is not a waypoint and takes no revive
export const findNearestTeleportWaypoint = (landmarks: readonly Landmark[], point: GroundPoint): Landmark | undefined =>
  findNearestLandmark(
    landmarks.filter((landmark): landmark is WaypointLandmark => landmark.kind === LandmarkKind.TeleportWaypoint),
    point,
  );
