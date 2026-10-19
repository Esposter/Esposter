import type { WindrisePlantsGround } from "#src/models/windrise/WindrisePlantsGround";

import { SLOPE_REACH } from "#src/services/windrise/constants";

// How steep the ground is at a point, from 0 flat to 1 sheer, as the terrain reads a vertex's
export const getSlope = (getHeight: WindrisePlantsGround["getHeight"], x: number, z: number): number => {
  const acrossX = getHeight(x - SLOPE_REACH, z) - getHeight(x + SLOPE_REACH, z);
  const acrossZ = getHeight(x, z - SLOPE_REACH) - getHeight(x, z + SLOPE_REACH);
  const up = SLOPE_REACH * 2;
  return 1 - up / Math.hypot(acrossX, up, acrossZ);
};
