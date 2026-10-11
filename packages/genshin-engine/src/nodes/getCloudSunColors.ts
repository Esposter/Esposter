import type { SkyUniforms } from "#src/models/atmosphere/SkyUniforms";
import type { Node } from "three/webgpu";

import { float, max, mix, pow } from "three/tsl";

// A cloud's lit and shade colours toward the sun, by how far toward it the ray looks, cubed. The back of the cloud takes
// Its own colours, from the sun behind it
export const getCloudSunColors = (
  {
    cloudFrontBackBlend,
    cloudLitBackColor,
    cloudLitColor,
    cloudShadeBackColor,
    cloudShadeColor,
  }: Pick<
    SkyUniforms,
    "cloudFrontBackBlend" | "cloudLitBackColor" | "cloudLitColor" | "cloudShadeBackColor" | "cloudShadeColor"
  >,
  sunCosine: Node<"float">,
): { lit: Node<"vec3">; shade: Node<"vec3"> } => {
  const toward = pow(max(sunCosine.mul(cloudFrontBackBlend).add(float(1).sub(cloudFrontBackBlend)), 0), 3);
  return {
    lit: mix(cloudLitBackColor, cloudLitColor, toward),
    shade: mix(cloudShadeBackColor, cloudShadeColor, toward),
  };
};
