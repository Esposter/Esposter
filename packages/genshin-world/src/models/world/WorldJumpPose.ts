import type { GroundPoint } from "genshin-engine";

// Where a jump lands: a point on the ground in world metres, how far above or into the ground it stands, read off the
// Ground when the jump is made, and the yaw the view faces in radians, as the free camera turns it
export interface WorldJumpPose {
  heightOffset: number;
  point: GroundPoint;
  yaw: number;
}
