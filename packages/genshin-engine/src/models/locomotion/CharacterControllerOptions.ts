import type { GroundQuery } from "#src/models/collision/GroundQuery";
import type { LandmarkCollider } from "#src/models/collision/LandmarkCollider";
import type { Vector3 } from "three";

// The ground and the landmarks a body moves against, read in one frame of coordinates, and where its feet start in it
export interface CharacterControllerOptions {
  ground: GroundQuery;
  landmarkCollider: LandmarkCollider;
  position: Vector3;
}
