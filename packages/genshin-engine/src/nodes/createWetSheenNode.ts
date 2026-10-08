import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { Node } from "three/webgpu";

import { WET_SHEEN_POWER, WET_SHEEN_STRENGTH } from "#src/nodes/constants";
import { cameraViewMatrix, normalView, positionViewDirection, vec4 } from "three/tsl";

// The sun's glint on a wet surface: a highlight at the half-way direction between the sun and the eye, lit only where
// The sun reaches, and in proportion to how wet the ground is
export const createWetSheenNode = ({ lightColor, sunDirection, wetness }: LightUniforms): Node<"vec3"> => {
  const sunDirectionView = cameraViewMatrix.mul(vec4(sunDirection, 0)).xyz.normalize();
  const halfway = sunDirectionView.add(positionViewDirection).normalize();
  const litMask = normalView.dot(sunDirectionView).saturate();
  const glint = normalView.dot(halfway).saturate().pow(WET_SHEEN_POWER);
  return lightColor.mul(glint.mul(litMask).mul(wetness).mul(WET_SHEEN_STRENGTH));
};
