import type { Vector3Tuple, Vector4Tuple } from "three";

// One bone of a rig: its path in the rig, the index of its parent (-1 for the root), and its rest pose, local to its parent
export interface AvatarBone {
  name: string;
  parent: number;
  position: Vector3Tuple;
  rotation: Vector4Tuple;
  scale: Vector3Tuple;
}
