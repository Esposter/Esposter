import type { SkyState } from "#src/models/atmosphere/SkyState";
import type { SkyTargets } from "#src/models/atmosphere/SkyTargets";
import type { Color } from "three";

import { DEFAULT_SKY_SHAPE } from "#src/atmosphere/constants";
import { computeWhiteBalance } from "#src/post/computeWhiteBalance";
import { toSceneColor } from "#src/post/toSceneColor";
import { Matrix3, Vector3 } from "three";

// The god rays' map is redrawn once the light has turned this far, a little over the angle it turns in two real
// Seconds, so a moving sun costs one shadow pass every other second rather than one a frame
const GODRAYS_REDRAW_COSINE = Math.cos((0.6 * Math.PI) / 180);
const godraysDirection = new Vector3();
const inverseWhiteBalance = new Matrix3();
// A colour the screen shows as it is, as the scene colour the white balance and the tone curve show as it
const writeShownColor = (displayColor: Color, sceneColor: Color): Color =>
  toSceneColor(displayColor, sceneColor).applyMatrix3(inverseWhiteBalance);
// A term a sky has none of (a halo, a glow) adds nothing, rather than the curve's black taken back to its floor
const writeTermColor = (displayColor: Color | undefined, sceneColor: Color): Color =>
  displayColor ? writeShownColor(displayColor, sceneColor) : sceneColor.setRGB(0, 0, 0);
// The sky state written into everything it lights: the light and the materials take the light's direction and
// Colour, the rim and the fog the horizon's, and the hemisphere its sky and ground. The colours the screen shows as
// They are, the sky's, its clouds' and the fog's, are measured off the references, so each is written as the scene
// Colour the white balance and the tone mapping show as it, the balance the state's own or none. Every write is to an existing value, so an hour passing rebuilds nothing and
// Allocates nothing
export const applySkyState = (
  skyState: SkyState,
  { fogUniforms, godraysLight, hemisphere, light, lightDistance, lightUniforms, postUniforms, skyUniforms }: SkyTargets,
): void => {
  const { horizonColor, lightColor, lightDirection, whiteBalance } = skyState;
  if (whiteBalance) computeWhiteBalance(whiteBalance, postUniforms.whiteBalance.value);
  else postUniforms.whiteBalance.value.identity();
  inverseWhiteBalance.copy(postUniforms.whiteBalance.value).invert();
  light.position.copy(light.target.position).addScaledVector(lightDirection, lightDistance);
  light.color.copy(lightColor);
  light.intensity = skyState.lightIntensity;
  hemisphere.color.copy(skyState.hemisphereSkyColor);
  hemisphere.groundColor.copy(skyState.hemisphereGroundColor);
  hemisphere.intensity = skyState.hemisphereIntensity;
  lightUniforms.lightColor.value.copy(lightColor);
  lightUniforms.sunDirection.value.copy(lightDirection);
  lightUniforms.rimColor.value.copy(horizonColor);
  writeShownColor(skyState.fogColor ?? horizonColor, fogUniforms.color.value);
  writeShownColor(lightColor, fogUniforms.scatterColor.value);
  fogUniforms.scatterDirection.value.copy(lightDirection);
  postUniforms.godraysColor.value.copy(lightColor);
  writeShownColor(skyState.cloudLitColor, skyUniforms.cloudLitColor.value);
  writeShownColor(skyState.cloudShadeColor, skyUniforms.cloudShadeColor.value);
  writeShownColor(skyState.cloudLitBackColor ?? skyState.cloudLitColor, skyUniforms.cloudLitBackColor.value);
  writeShownColor(skyState.cloudShadeBackColor ?? skyState.cloudShadeColor, skyUniforms.cloudShadeBackColor.value);
  writeShownColor(horizonColor, skyUniforms.horizonColor.value);
  writeShownColor(skyState.horizonBackColor ?? horizonColor, skyUniforms.horizonBackColor.value);
  writeShownColor(skyState.zenithBackColor ?? skyState.zenithColor, skyUniforms.zenithBackColor.value);
  writeTermColor(skyState.haloColor, skyUniforms.haloColor.value);
  writeTermColor(skyState.sunHaloColor, skyUniforms.sunHaloColor.value);
  skyUniforms.lightColor.value.copy(lightColor);
  skyUniforms.moonDirection.value.copy(skyState.moonDirection);
  writeTermColor(skyState.moonGlowColor, skyUniforms.moonGlowColor.value);
  skyUniforms.starIntensity.value = skyState.starIntensity;
  skyUniforms.sunDirection.value.copy(skyState.sunDirection);
  writeShownColor(skyState.zenithColor, skyUniforms.zenithColor.value);
  const { frontBackBlend, haloHeight, horizonBand, moonSize, sunHaloSize } = skyState.shape ?? DEFAULT_SKY_SHAPE;
  skyUniforms.frontBackBlend.value = frontBackBlend;
  skyUniforms.haloHeight.value = haloHeight;
  skyUniforms.horizonBand.value = horizonBand;
  skyUniforms.moonSize.value = moonSize;
  skyUniforms.sunHaloSize.value = sunHaloSize;
  if (!godraysLight) return;
  godraysDirection.subVectors(godraysLight.position, godraysLight.target.position).normalize();
  // A light still standing on its target has no direction, which fails the test, so the first call places it
  if (godraysDirection.dot(lightDirection) >= GODRAYS_REDRAW_COSINE) return;
  godraysLight.position.copy(godraysLight.target.position).addScaledVector(lightDirection, lightDistance);
  godraysLight.shadow.needsUpdate = true;
};
