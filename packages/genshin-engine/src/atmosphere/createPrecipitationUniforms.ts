import type { PrecipitationUniforms } from "#src/models/atmosphere/PrecipitationUniforms";

import { Vector3 } from "three";
import { uniform } from "three/tsl";

// Nothing falls until a weather writes its particles, so the shares drawn start at none
export const createPrecipitationUniforms = (): PrecipitationUniforms => ({
  density: uniform(0),
  eye: uniform(new Vector3()),
  fallSpeed: uniform(0),
  length: uniform(0),
  opacity: uniform(0),
  splashDensity: uniform(0),
  sway: uniform(0),
  width: uniform(0),
  windDrift: uniform(0),
});
