import type { PlateauFeature } from "#src/models/terrain/PlateauFeature";

import { MathUtils } from "three";

// A plateau's flat top, its edge blended down across its falloff past its radius
export const getPlateauHeight = (feature: PlateauFeature, x: number, z: number): number => {
  const { falloff, height, radius, x: centreX, z: centreZ } = feature;
  return height * (1 - MathUtils.smoothstep(Math.hypot(x - centreX, z - centreZ), radius, radius + falloff));
};
