import type { Landmark } from "#src/models/world/Landmark";
import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A jump lands at a landmark's arrival, the game's own place for it, facing the turn the game gives there and at the
// Height that place stands. A landmark with no arrival read from the game is an error, since a jump has nowhere to land
export const computeJumpPose = (landmark: Landmark): WorldJumpPose => {
  if (!landmark.arrival) throw new InvalidOperationError(Operation.Read, landmark.id, "has no arrival to jump to");
  const { arrival } = landmark;
  return {
    heightOffset: arrival.heightOffset,
    point: { x: arrival.position.x, z: arrival.position.z },
    yaw: arrival.rotation,
  };
};
