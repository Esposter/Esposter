import type { WorldJumpPose } from "#src/models/world/WorldJumpPose";
import type { Vector3Like } from "three";

// What the realm gadget reads where it is used: the open world's ground under a point, the player's place and heading,
// And the jump that sets them down
export interface HomeRealmToggleOptions {
  getGroundHeight: (x: number, z: number) => number;
  jumpTo: (pose: WorldJumpPose) => void;
  standing: { position: Vector3Like; yaw: number };
}
