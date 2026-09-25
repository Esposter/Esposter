import type { Vector3Tuple } from "three";

// A box in the world's units, from its lowest corner to its highest: what a thing drawn apart from the voxels collides
// As, and what a prompt outlines
export interface WorldBox {
  max: Vector3Tuple;
  min: Vector3Tuple;
}
