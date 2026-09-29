import type { Vector3 } from "three";

export interface BranchSegment {
  end: Vector3;
  endRadius: number;
  start: Vector3;
  startRadius: number;
}
