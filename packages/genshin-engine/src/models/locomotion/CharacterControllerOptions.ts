import type { GroundQuery } from "#src/models/collision/GroundQuery";
import type { LandmarkCollider } from "#src/models/collision/LandmarkCollider";
import type { Vector3 } from "three";

// The ground and the landmarks a body moves against, read in one frame of coordinates, and where its feet start in it
export interface CharacterControllerOptions {
  ground: GroundQuery;
  landmarkCollider: LandmarkCollider;
  position: Vector3;
  // The most stamina the body starts with and holds, which the Statues of The Seven raise as their levels are reached
  staminaMaximum: number;
}
