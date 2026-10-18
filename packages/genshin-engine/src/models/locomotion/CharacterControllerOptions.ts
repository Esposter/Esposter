import type { GroundQuery } from "#src/models/collision/GroundQuery";
import type { LandmarkCollider } from "#src/models/collision/LandmarkCollider";
import type { Stamina } from "#src/models/locomotion/Stamina";
import type { Vector3 } from "three";

// The ground and the landmarks a body moves against, read in one frame of coordinates, and where its feet start in it. Its
// Stamina is one of two: the party's pool, which the pool's owner builds with the maximum and the consumption multiplier
// It holds and which a kit restores to too, or a pool of the body's own, built full at a maximum with the multiplier. The
// Two never mix, so the pool a body spends from is never given a multiplier it ignores
export type CharacterControllerOptions = {
  ground: GroundQuery;
  landmarkCollider: LandmarkCollider;
  position: Vector3;
} & (
  | {
      // The factor every stamina spend is multiplied by, read at each spend, and 1 when none is given
      getStaminaConsumptionMultiplier?: () => number;
      stamina?: never;
      // The most stamina the body starts with and holds, which the Statues of The Seven raise as their levels are reached
      staminaMaximum: number;
    }
  | { getStaminaConsumptionMultiplier?: never; stamina: Stamina; staminaMaximum?: never }
);
