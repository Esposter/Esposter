import type { StoneLightUniforms } from "#src/models/nodes/StoneLightUniforms";
import type { StoneMaterialOptions } from "#src/models/nodes/StoneMaterialOptions";
import type { Node } from "three/webgpu";

import { StoneNodeMaterial } from "#src/models/nodes/StoneNodeMaterial";
import { createStoneGlowNode } from "#src/nodes/createStoneGlowNode";
import { Color } from "three";
import { color, vec3 } from "three/tsl";

// A stone lit as the game's deferred pass lights its towers, bridges, walkway and door, from the scene's shared stone
// Light (`StoneLightingModel`): its albedo through the sun's toon ramp and the sky's harmonics, and a glow along its
// Edges (`createStoneGlowNode`). It draws no outline, as the game's stone draws none. Its smoothness and specular colour
// Wait on the pass's highlight, which the light's solve does not yet hold. A light of the stone's own, such as a door
// Opening, adds to its glow
export const createStoneMaterial = (
  options: StoneMaterialOptions,
  stoneLight: StoneLightUniforms,
  glowNode: Node<"vec3"> = vec3(0),
): StoneNodeMaterial => {
  const material = new StoneNodeMaterial(stoneLight);
  material.colorNode = color(new Color(options.albedo));
  material.emissiveNode = createStoneGlowNode(options).add(glowNode);
  return material;
};
