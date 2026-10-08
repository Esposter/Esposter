import type { PmxPhysicsMode } from "#src/models/character/PmxPhysicsMode";
import type { PmxRigidBodyShape } from "#src/models/character/PmxRigidBodyShape";
import type { Vector3Tuple } from "three";

// A PMX rigid body, which MMD's physics swings hair and cloth with: the bone it follows or moves, the group it is in and
// The groups it passes through as a mask of bits, its shape's size, place and turn, and the physics' readings for it
export interface PmxRigidBody {
  angularDamping: number;
  boneIndex: number;
  friction: number;
  group: number;
  linearDamping: number;
  mass: number;
  name: string;
  nonCollidingGroups: number;
  physicsMode: PmxPhysicsMode;
  position: Vector3Tuple;
  restitution: number;
  rotation: Vector3Tuple;
  shape: PmxRigidBodyShape;
  size: Vector3Tuple;
}
