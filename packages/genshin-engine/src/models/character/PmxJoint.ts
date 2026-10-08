import type { PmxJointKind } from "#src/models/character/PmxJointKind";
import type { Vector3Tuple } from "three";

// A PMX joint between two rigid bodies, by their index in the model's list: its place and turn, how far it lets the
// Second move and turn from the first on each axis, and the springs pulling it back
export interface PmxJoint {
  firstRigidBodyIndex: number;
  kind: PmxJointKind;
  name: string;
  position: Vector3Tuple;
  rotation: Vector3Tuple;
  rotationMaximum: Vector3Tuple;
  rotationMinimum: Vector3Tuple;
  rotationSpring: Vector3Tuple;
  secondRigidBodyIndex: number;
  translationMaximum: Vector3Tuple;
  translationMinimum: Vector3Tuple;
  translationSpring: Vector3Tuple;
}
