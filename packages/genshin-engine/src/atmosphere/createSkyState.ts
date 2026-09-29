import type { SkyState } from "#src/atmosphere/SkyState";

import { Color, Vector3 } from "three";

// A sky state to sample into every frame, so sampling allocates nothing
export const createSkyState = (): SkyState => ({
  cloudLitColor: new Color(),
  cloudShadeColor: new Color(),
  hemisphereGroundColor: new Color(),
  hemisphereIntensity: 0,
  hemisphereSkyColor: new Color(),
  horizonColor: new Color(),
  lightColor: new Color(),
  lightDirection: new Vector3(),
  lightIntensity: 0,
  moonDirection: new Vector3(),
  starIntensity: 0,
  sunDirection: new Vector3(),
  zenithColor: new Color(),
});
