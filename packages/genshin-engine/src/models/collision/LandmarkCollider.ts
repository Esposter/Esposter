import type { CapsulePush } from "#src/models/collision/CapsulePush";
import type { Object3D, Vector3 } from "three";
import type { Capsule } from "three/examples/jsm/math/Capsule.js";

// The landmarks' meshes as what a body and a camera collide with, each landmark's triangles held in an octree built once
// In the frame of the group the landmarks are placed in. A sphere's radius must be more than none
export interface LandmarkCollider {
  // How far a sphere of the radius travels from the origin along the unit direction before it touches a landmark, at
  // Most the distance given
  castSphere: (origin: Vector3, direction: Vector3, distance: number, radius: number) => number;
  // How the capsule is pushed out of every landmark it overlaps, or nothing where it overlaps none
  pushCapsule: (capsule: Capsule) => CapsulePush | undefined;
  // An octree for each of the root's children not yet held, and none for those no longer its children
  syncLandmarks: (root: Object3D) => void;
}
