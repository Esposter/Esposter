import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { Node } from "three/webgpu";

import { createWaterRippleNormal } from "#src/nodes/createWaterRippleNormal";
import { DoubleSide } from "three";
import { float, positionWorld, smoothstep } from "three/tsl";
import { MeshBasicNodeMaterial } from "three/webgpu";

// The slope at which a ripple's crest reads as fully lit. Provisional until a fishing frame is eye-checked against it
const CREST_SLOPE = 0.02;
const RING_OPACITY = 0.6;

// A fishing ripple, a ring or a splash's spray, lit by the light and shown where the water's own ripples crest, so it
// Breaks up as the water does. It fades with `age`, from zero, full, to one, gone, and its shape is its geometry's
export const createFishingRippleMaterial = ({
  age,
  lightUniforms,
}: {
  age: Node<"float">;
  lightUniforms: Pick<LightUniforms, "lightColor">;
}): MeshBasicNodeMaterial => {
  const rippleMaterial = new MeshBasicNodeMaterial({ depthWrite: false, side: DoubleSide, transparent: true });
  const normal = createWaterRippleNormal(positionWorld.xz);
  const crest = smoothstep(0, CREST_SLOPE, normal.xz.length());
  rippleMaterial.colorNode = lightUniforms.lightColor;
  rippleMaterial.opacityNode = crest.mul(float(1).sub(age)).mul(RING_OPACITY);
  return rippleMaterial;
};
