import type { WaterUniforms } from "#src/water/WaterUniforms";

import { Color } from "three";
import { uniform } from "three/tsl";

// One set per world, read by the water surface and the ground's caustics
export const createWaterUniforms = (): WaterUniforms => ({
  causticStrength: uniform(0),
  deepColor: uniform(new Color()),
  deepDepth: uniform(1),
  foamColor: uniform(new Color(0xffffff)),
  foamDepth: uniform(0),
  level: uniform(0),
  shallowColor: uniform(new Color()),
  underwaterFogColor: uniform(new Color()),
  underwaterFogDensity: uniform(0),
});
