import type { Vector3 } from "three";

// How a capsule is pushed out of what it overlaps: the unit normal it moves along, and how far in metres
export interface CapsulePush {
  depth: number;
  normal: Vector3;
}
