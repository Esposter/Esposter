import type { SkyUniforms } from "#src/atmosphere/SkyUniforms";

import { DEFAULT_SKY_SHAPE } from "#src/atmosphere/constants";
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
  frontBackBlend: uniform(DEFAULT_SKY_SHAPE.frontBackBlend),
  haloColor: uniform(new Color(0, 0, 0)),
  haloHeight: uniform(DEFAULT_SKY_SHAPE.haloHeight),
  horizonBackColor: uniform(new Color()),
  horizonBand: uniform(DEFAULT_SKY_SHAPE.horizonBand),
  horizonColor: uniform(new Color()),
  lightColor: uniform(new Color()),
  moonDirection: uniform(new Vector3(0, -1, 0)),
  moonGlowColor: uniform(new Color(0, 0, 0)),
  moonSize: uniform(DEFAULT_SKY_SHAPE.moonSize),
  starIntensity: uniform(0),
  sunDirection: uniform(new Vector3(0, 1, 0)),
  sunHaloColor: uniform(new Color(0, 0, 0)),
  sunHaloSize: uniform(DEFAULT_SKY_SHAPE.sunHaloSize),
  zenithBackColor: uniform(new Color()),
  zenithColor: uniform(new Color()),
});
