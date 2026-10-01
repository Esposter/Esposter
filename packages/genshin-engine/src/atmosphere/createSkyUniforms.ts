import type { SkyUniforms } from "#src/atmosphere/SkyUniforms";

import { Color, Vector2, Vector3 } from "three";
import { uniform } from "three/tsl";

export const createSkyUniforms = (): SkyUniforms => ({
  cloudCoverage: uniform(0),
  cloudDrift: uniform(new Vector2()),
  cloudFrontBackBlend: uniform(1),
  cloudLitBackColor: uniform(new Color()),
  cloudLitColor: uniform(new Color()),
  cloudShadeBackColor: uniform(new Color()),
  cloudShadeColor: uniform(new Color()),
  cloudSunBrighten: uniform(0),
  frontBackBlend: uniform(1),
  haloColor: uniform(new Color(0, 0, 0)),
  haloHeight: uniform(1),
  horizonBand: uniform(0.45),
  horizonBackColor: uniform(new Color()),
  horizonColor: uniform(new Color()),
  lightColor: uniform(new Color()),
  moonDirection: uniform(new Vector3(0, -1, 0)),
  moonGlowColor: uniform(new Color(0, 0, 0)),
  moonSize: uniform(1),
  starIntensity: uniform(0),
  sunDirection: uniform(new Vector3(0, 1, 0)),
  sunHaloColor: uniform(new Color(0, 0, 0)),
  sunHaloSize: uniform(1),
  zenithBackColor: uniform(new Color()),
  zenithColor: uniform(new Color()),
});
