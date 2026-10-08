import type { Landmark } from "#src/models/world/Landmark";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

import { JUMP_STANDOFF_DISTANCE } from "#src/services/map/constants";

// A jump to a landmark lands in front of it, along the way it faces, and faces back at it, so the view arrives on what
// Was jumped to: a landmark turned by its rotation faces along the sine and cosine of it, and a view at that same yaw
// Looks the opposite way
export const computeJumpPose = ({ heightOffset, position, rotation }: Landmark): WorldJumpPose => ({
  heightOffset,
  point: {
    x: position.x + Math.sin(rotation) * JUMP_STANDOFF_DISTANCE,
    z: position.z + Math.cos(rotation) * JUMP_STANDOFF_DISTANCE,
  },
  yaw: rotation,
});
