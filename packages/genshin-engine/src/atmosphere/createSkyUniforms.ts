import type { SkyUniforms } from "#src/atmosphere/SkyUniforms";

import { Color, Vector2, Vector3 } from "three";
import { uniform } from "three/tsl";

export const createSkyUniforms = (): SkyUniforms => ({
  cloudCoverage: uniform(0),
  cloudDrift: uniform(new Vector2()),
  cloudLitColor: uniform(new Color()),
  cloudShadeColor: uniform(new Color()),
  horizonColor: uniform(new Color()),
  lightColor: uniform(new Color()),
  moonDirection: uniform(new Vector3(0, -1, 0)),
  starIntensity: uniform(0),
  sunDirection: uniform(new Vector3(0, 1, 0)),
  zenithColor: uniform(new Color()),
});
