import type { Vector3 } from "three";

// One straight length of pipework between its two ends, in metres
export interface PipeRun {
  from: Vector3;
  to: Vector3;
}
