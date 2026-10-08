import type { Vector3 } from "three";

// The ground at a point: its height in metres, and the unit normal of the surface there
export interface GroundSample {
  height: number;
  normal: Vector3;
}
