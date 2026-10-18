import type { HomeRealmVisit } from "#src/models/home/HomeRealmVisit";
import type { Vector3Like } from "three";

import { computeStandingPose } from "#src/services/map/computeStandingPose";

// The place the player goes into the realm from: the region they stand in and the pose they are at, which their height
// Above the ground beneath them gives. The realm's gadget and every teleport out of it return the player to it
export const computeHomeRealmVisit = (
  standing: { position: Vector3Like; yaw: number },
  groundHeight: number,
  regionId: string,
): HomeRealmVisit => ({ pose: computeStandingPose(standing, groundHeight), regionId });
