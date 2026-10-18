import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { Vector3Like } from "three";

// The pose a player stands at: the point they stand over, the yaw they face, and how far above the ground beneath them they
// Are, which a jump back to the pose lands them at again
export const computeStandingPose = (
  { position, yaw }: { position: Vector3Like; yaw: number },
  groundHeight: number,
): WorldJumpPose => ({ heightOffset: position.y - groundHeight, point: { x: position.x, z: position.z }, yaw });
