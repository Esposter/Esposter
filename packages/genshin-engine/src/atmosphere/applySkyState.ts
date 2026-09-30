import type { SkyState } from "#src/atmosphere/SkyState";
import type { SkyTargets } from "#src/atmosphere/SkyTargets";

import { Vector3 } from "three";

// The god rays' map is redrawn once the light has turned this far, a little over the angle it turns in two real
// Seconds, so a moving sun costs one shadow pass every other second rather than one a frame
const GODRAYS_REDRAW_COSINE = Math.cos((0.6 * Math.PI) / 180);
const godraysDirection = new Vector3();
// The sky state written into everything it lights: the light and the materials take the light's direction and
// Colour, the rim and the fog the horizon's, and the hemisphere its sky and ground. Every write is to an existing
// Value, so an hour passing rebuilds nothing
export const applySkyState = (
  skyState: SkyState,
  { fogUniforms, godraysLight, hemisphere, light, lightDistance, lightUniforms, postUniforms, skyUniforms }: SkyTargets,
): void => {
  const { horizonColor, lightColor, lightDirection } = skyState;
  light.position.copy(light.target.position).addScaledVector(lightDirection, lightDistance);
  light.color.copy(lightColor);
  light.intensity = skyState.lightIntensity;
  hemisphere.color.copy(skyState.hemisphereSkyColor);
  hemisphere.groundColor.copy(skyState.hemisphereGroundColor);
  hemisphere.intensity = skyState.hemisphereIntensity;
  lightUniforms.lightColor.value.copy(lightColor);
  lightUniforms.sunDirection.value.copy(lightDirection);
  lightUniforms.rimColor.value.copy(horizonColor);
  fogUniforms.color.value.copy(skyState.fogColor ?? horizonColor);
  postUniforms.godraysColor.value.copy(lightColor);
  skyUniforms.cloudLitColor.value.copy(skyState.cloudLitColor);
  skyUniforms.cloudShadeColor.value.copy(skyState.cloudShadeColor);
  skyUniforms.horizonColor.value.copy(horizonColor);
  skyUniforms.lightColor.value.copy(lightColor);
  skyUniforms.moonDirection.value.copy(skyState.moonDirection);
  skyUniforms.starIntensity.value = skyState.starIntensity;
  skyUniforms.sunDirection.value.copy(skyState.sunDirection);
  skyUniforms.zenithColor.value.copy(skyState.zenithColor);
  godraysDirection.subVectors(godraysLight.position, godraysLight.target.position).normalize();
  // A light still standing on its target has no direction, which fails the test, so the first call places it
  if (godraysDirection.dot(lightDirection) >= GODRAYS_REDRAW_COSINE) return;
  godraysLight.position.copy(godraysLight.target.position).addScaledVector(lightDirection, lightDistance);
  godraysLight.shadow.needsUpdate = true;
};
