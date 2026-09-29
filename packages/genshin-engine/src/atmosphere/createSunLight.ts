import type { SunLight } from "#src/atmosphere/SunLight";
import type { SunLightOptions } from "#src/atmosphere/SunLightOptions";

import { DirectionalLight } from "three";
import { CSMShadowNode } from "three/examples/jsm/csm/CSMShadowNode.js";

// How far behind each cascade toward the sun its camera starts, so a tall caster outside the view still shadows it
const LIGHT_MARGIN = 100;
const SHADOW_BIAS = -0.0005;
const SHADOW_NORMAL_BIAS = 0.05;
// The sun, casting through cascades split from the eye outward, so near shadows stay crisp and far ones cheap: each
// Cascade's map spans more ground than the last, which blurs the far shadows into the soft blotches the game draws.
// Neighbouring cascades fade into each other rather than meeting at a seam. The cascades follow the camera on their
// Own, so the light's position sets only the sun's direction
export const createSunLight = ({
  cascadeCount,
  color,
  intensity,
  maxFar,
  shadowMapSize,
}: SunLightOptions): SunLight => {
  const light = new DirectionalLight(color, intensity);
  light.castShadow = true;
  light.shadow.mapSize.set(shadowMapSize, shadowMapSize);
  light.shadow.bias = SHADOW_BIAS;
  light.shadow.normalBias = SHADOW_NORMAL_BIAS;
  light.shadow.camera.far = maxFar + LIGHT_MARGIN * 2;
  const cascadedShadowNode = new CSMShadowNode(light, {
    cascades: cascadeCount,
    lightMargin: LIGHT_MARGIN,
    maxFar,
    mode: "practical",
  });
  cascadedShadowNode.fade = true;
  light.shadow.shadowNode = cascadedShadowNode;
  return { cascadedShadowNode, light };
};
