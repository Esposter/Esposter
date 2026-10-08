import type { Vector3Tuple } from "three";

// A PMX bone: where it stands in the model's space, not its parent's, and its parent by index, -1 for a root
export interface PmxBone {
  name: string;
  parentIndex: number;
  position: Vector3Tuple;
}
