import type { LandmarkArrival } from "#src/models/world/LandmarkArrival";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

import { DOMAIN_ARENA_OFFSET } from "#src/services/domains/constants";

// The pose an entered domain's level lands at: the stand-in arena, a flat place DOMAIN_ARENA_OFFSET east of its entrance's
// Arrival, facing the same turn and standing at the same height. PROVISIONAL until the domain's scene export gives its own
// Transfer point, which replaces the offset
export const computeDomainScenePose = ({ heightOffset, position, rotation }: LandmarkArrival): WorldJumpPose => ({
  heightOffset,
  point: { x: position.x + DOMAIN_ARENA_OFFSET, z: position.z },
  yaw: rotation,
});
