import type { LightUniforms } from "#src/nodes/LightUniforms";
import type { Node } from "three/webgpu";

import { cameraViewMatrix, float, normalView, positionViewDirection, vec4 } from "three/tsl";

const RIM_POWER = 4;
// The halo along a silhouette: a Fresnel term, strongest where the surface turns away from the eye, kept to the side
// The sun lights so a shaded edge stays in shade, and tinted by the sky
export const createRimNode = ({ rimColor, rimStrength, sunDirection }: LightUniforms): Node<"vec3"> => {
  const sunDirectionView = cameraViewMatrix.mul(vec4(sunDirection, 0)).xyz.normalize();
  const fresnel = float(1).sub(normalView.dot(positionViewDirection).saturate()).pow(RIM_POWER);
  const litMask = normalView.dot(sunDirectionView).saturate();
  return rimColor.mul(fresnel.mul(litMask).mul(rimStrength));
};
