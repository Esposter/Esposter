import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { Vector3Tuple } from "three";
import type { Node } from "three/webgpu";

import { cameraViewMatrix, float, normalView, positionViewDirection, vec3, vec4 } from "three/tsl";

// A PMX material's specular highlight, Blinn-Phong: the half vector between the sun and the eye raised to the
// Material's specularity, lit only on the side the sun reaches and tinted by the sun's colour
export const createSpecularNode = (
  { lightColor, sunDirection }: LightUniforms,
  [red, green, blue]: Vector3Tuple,
  specularity: number,
): Node<"vec3"> => {
  const sunDirectionView = cameraViewMatrix.mul(vec4(sunDirection, 0)).xyz.normalize();
  const halfVector = sunDirectionView.add(positionViewDirection).normalize();
  const highlight = normalView.dot(halfVector).saturate().pow(float(specularity));
  const litMask = normalView.dot(sunDirectionView).saturate();
  return vec3(red, green, blue).mul(lightColor).mul(highlight.mul(litMask));
};
