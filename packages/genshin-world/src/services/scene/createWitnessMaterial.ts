import type { WitnessMaterial } from "#src/models/scene/WitnessMaterial";
import type { WitnessMaterialFactory } from "#src/models/scene/WitnessMaterialFactory";
import type { SceneMaterial } from "genshin-engine";
import type { Texture } from "three";
import type { Node } from "three/webgpu";

import { WitnessProperty } from "#src/models/scene/WitnessProperty";
import { LEAF_SHADER } from "#src/services/scene/constants";
import { DoubleSide } from "three";
import { color, normalMap, step, texture, vec3 } from "three/tsl";

// One exported material drawn as the stone's shader writes it into the game's G-buffer (`miHoYo/Scene/Login Base`):
// The diffuse texture tinted by its colour, its normal map, and its mask texture (`SMBE`, read by the inventory) with
// Emission in alpha where the material turns it on, drawn only where its length reaches the material's emission range,
// The program writing every glow under it as none. It is laid over a material of the host's, whose colour it multiplies
// And whose emission it adds to, so it is lit as the host's own stand-ins are: the login's by the game's deferred pass
// From its stone light, the world's by the ramp with their wetness and rim, and a stand-in and its export differ only in
// What each draws. Its rim glow is not drawn: the deferred pass lights the glow's pixels apart, and drawn as the program
// Grades it, the walkway's own glow lit its middle lane near white where the game shows grey-blue stone, so a scene's
// Glow is its host's, as fitted to the frames; the mask's smoothness and metal wait on the pass's highlight
export const createWitnessMaterial = (
  sceneMaterial: SceneMaterial,
  nameTextureMap: ReadonlyMap<string, Texture>,
  createMaterial: WitnessMaterialFactory,
): WitnessMaterial => {
  const { colors, floats, shader, textures } = sceneMaterial;
  const material = createMaterial(sceneMaterial);
  const getTexture = (slot: WitnessProperty): Texture | undefined => {
    const slotTexture = textures[slot];
    return slotTexture ? nameTextureMap.get(slotTexture.name) : undefined;
  };
  const [red = 1, green = 1, blue = 1] = colors[WitnessProperty.Color] ?? [];
  const diffuse = getTexture(WitnessProperty.MainTexture);
  const tint = vec3(red, green, blue);
  const albedoNode = diffuse ? texture(diffuse).rgb.mul(tint) : tint;
  // The host's colour and emission are the vectors its own stand-ins draw with, which three types as any node
  const colorNode = material.colorNode as Node<"vec3"> | null;
  const emissiveNode = material.emissiveNode as Node<"vec3"> | null;
  material.colorNode = colorNode ? colorNode.mul(albedoNode) : albedoNode;
  // The leaf cards are cut where their texture's alpha falls under the material's cutoff, as the game's foliage shader
  // Clips them, and drawn from both sides: the leaf mesh holds no back face for any card and its normals are a field
  // Over the crown at right angles to the cards, so a card culled from behind would vanish from every view behind it
  if (shader === LEAF_SHADER) {
    material.userData.isLeafCard = true;
    material.side = DoubleSide;
    // The export's own texture cuts its cards, in place of the stand-in's oval
    if (diffuse) material.maskNode = texture(diffuse).a.greaterThan(floats[WitnessProperty.Cutoff] ?? 0);
  }
  const normal = getTexture(WitnessProperty.NormalMap);
  if (normal) material.normalNode = normalMap(texture(normal));
  const mask = getTexture(WitnessProperty.DetailMask);
  if (mask && floats[WitnessProperty.EmissionType]) {
    const [emissionRed = 0, emissionGreen = 0, emissionBlue = 0] = colors[WitnessProperty.EmissionColor] ?? [];
    const emissionNode = color(emissionRed, emissionGreen, emissionBlue)
      .mul(texture(mask).a)
      .mul(floats[WitnessProperty.EmissionStrength] ?? 1);
    const glowNode = emissionNode.mul(step(floats[WitnessProperty.EmissionRange] ?? 0, emissionNode.length()));
    material.emissiveNode = emissiveNode ? emissiveNode.add(glowNode) : glowNode;
  }
  return material;
};
