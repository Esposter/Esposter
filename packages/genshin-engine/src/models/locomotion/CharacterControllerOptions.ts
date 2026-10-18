import type { GroundQuery } from "#src/models/collision/GroundQuery";
import type { LandmarkCollider } from "#src/models/collision/LandmarkCollider";
import type { Stamina } from "#src/models/locomotion/Stamina";
import type { Vector3 } from "three";

// The ground and the landmarks a body moves against, read in one frame of coordinates, and where its feet start in it
export interface CharacterControllerOptions {
  // The factor every stamina spend is multiplied by, read at each spend, and 1 when none is given
  getStaminaConsumptionMultiplier?: () => number;
  ground: GroundQuery;
  landmarkCollider: LandmarkCollider;
  position: Vector3;
  // The party's stamina pool the body spends from, which a kit restores to too, or a new pool full at the maximum when none is given
  stamina?: Stamina;
  // The most stamina the body starts with and holds, which the Statues of The Seven raise as their levels are reached
  staminaMaximum: number;
}
