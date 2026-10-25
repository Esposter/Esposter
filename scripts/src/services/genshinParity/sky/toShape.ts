import type { SkyShape } from "genshin-engine";

import { clamp } from "#src/services/genshinParity/shared/clamp";

// The least a reach or a size is held at, as the shader divides by it, and the least the sun's halo and the moon are:
// Smaller, a halo or a glow spreads over the whole sky and stands in for its colours, as clouds pull it
const LEAST_SHAPE = 1e-3;
const LEAST_SUN_HALO_SIZE = 1;
const LEAST_MOON_SIZE = 0.1;

// The blend between the colours toward the sun and away from it is a share, as the shader reads it
export const toShape = ([
  frontBackBlend = 0,
  haloHeight = 0,
  horizonBand = 0,
  moonSize = 0,
  sunHaloSize = 0,
]: readonly number[]): SkyShape => ({
  frontBackBlend: clamp(frontBackBlend, 0, 1),
  haloHeight: Math.max(haloHeight, LEAST_SHAPE),
  horizonBand: Math.max(horizonBand, LEAST_SHAPE),
  moonSize: Math.max(moonSize, LEAST_MOON_SIZE),
  sunHaloSize: Math.max(sunHaloSize, LEAST_SUN_HALO_SIZE),
});
