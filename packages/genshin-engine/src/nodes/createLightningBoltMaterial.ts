import type { UniformNode } from "three/webgpu";

import { LIGHTNING_BOLT_BRIGHTNESS, LIGHTNING_BOLT_COLOR } from "#src/atmosphere/constants";
import { AdditiveBlending, DoubleSide } from "three";
import {
  attribute,
  cameraPosition,
  color,
  cross,
  modelWorldMatrixInverse,
  normalize,
  positionGeometry,
  vec4,
} from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";

// A bolt's channel glowing as bright as its flash, each segment a ribbon spread across its own direction to face the
// Eye, so a bolt seen from any side has its width. It adds light and writes no depth, so it shines through the haze
export const createLightningBoltMaterial = (flash: UniformNode<"float", number>): MeshBasicNodeMaterial => {
  const lightningBoltMaterial = new MeshBasicNodeMaterial({
    blending: AdditiveBlending,
    depthWrite: false,
    side: DoubleSide,
    transparent: true,
  });
  const eye = modelWorldMatrixInverse.mul(vec4(cameraPosition, 1)).xyz;
  const right = normalize(cross(attribute("boltDirection", "vec3"), eye.sub(positionGeometry)));
  lightningBoltMaterial.positionNode = positionGeometry.add(right.mul(attribute("boltSide", "float")));
  lightningBoltMaterial.colorNode = color(LIGHTNING_BOLT_COLOR).mul(LIGHTNING_BOLT_BRIGHTNESS);
  lightningBoltMaterial.opacityNode = flash;
  return lightningBoltMaterial;
};
