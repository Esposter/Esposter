import type { StoneLightUniforms } from "#src/nodes/StoneLightUniforms";
import type { StoneMaterialOptions } from "#src/nodes/StoneMaterialOptions";
import type { Node } from "three/webgpu";

import { StoneNodeMaterial } from "#src/nodes/StoneNodeMaterial";
import { Color } from "three";
import { color, float, normalView, positionViewDirection, vec3 } from "three/tsl";

// A stone lit as the game's deferred pass lights its towers, bridges, walkway and door, from the scene's shared stone
// Light (`StoneLightingModel`): its albedo through the sun's toon ramp and the sky's harmonics, and a glow along its
// Edges, a Fresnel term raised to its power at its strength, in its own colour. It draws no outline, as the game's
// Stone draws none. Its smoothness and specular colour wait on the pass's highlight, which the light's solve does not
// Yet hold. A light of the stone's own, such as a door opening, adds to its glow
export const createStoneMaterial = (
  { albedo, rimColor, rimPower, rimStrength }: StoneMaterialOptions,
  stoneLight: StoneLightUniforms,
  glowNode: Node<"vec3"> = vec3(0),
): StoneNodeMaterial => {
  const material = new StoneNodeMaterial(stoneLight);
  material.colorNode = color(new Color(albedo));
  const fresnel = float(1).sub(normalView.dot(positionViewDirection).saturate()).pow(rimPower);
  material.emissiveNode = color(new Color().fromArray(rimColor)).mul(fresnel.mul(rimStrength)).add(glowNode);
  return material;
};
