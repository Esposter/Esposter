import type { PlateauFeature } from "#src/models/terrain/PlateauFeature";

import { MathUtils } from "three";

// The share of a plateau's height at a point: all of it inside its radius, blended down to none across its falloff
export const getPlateauBlend = (feature: PlateauFeature, x: number, z: number): number => {
  const { falloff, radius, x: centreX, z: centreZ } = feature;
  return 1 - MathUtils.smoothstep(Math.hypot(x - centreX, z - centreZ), radius, radius + falloff);
};
