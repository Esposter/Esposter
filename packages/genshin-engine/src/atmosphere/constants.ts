import type { SkyGradient } from "#src/atmosphere/SkyGradient";
import type { SkyShape } from "#src/atmosphere/SkyShape";

import { MathUtils } from "three";

// The sky's shape where a state sets none of its own
export const DEFAULT_SKY_SHAPE: Readonly<SkyShape> = {
  frontBackBlend: 1,
  haloHeight: 1,
  horizonBand: 0.45,
  moonSize: 1,
  sunHaloSize: 1,
};
// The smoothstep a sky with no gradient of its own falls by, as 33 samples
const DEFAULT_SAMPLE_COUNT = 33;
export const DEFAULT_SKY_GRADIENT: SkyGradient = {
  green: Array.from({ length: DEFAULT_SAMPLE_COUNT }, () => 0),
  red: Array.from(
    { length: DEFAULT_SAMPLE_COUNT },
    (_value, index) => 1 - MathUtils.smoothstep(index, 0, DEFAULT_SAMPLE_COUNT - 1),
  ),
};
