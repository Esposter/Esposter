import type { WitnessMaterial } from "#src/models/scene/WitnessMaterial";
import type { WitnessMaterialFactory } from "#src/models/scene/WitnessMaterialFactory";
import type { SceneMaterial } from "genshin-engine";
import type { Texture } from "three";
import type { Node } from "three/webgpu";

import { WitnessKeyword } from "#src/models/scene/WitnessKeyword";
import { WitnessProperty } from "#src/models/scene/WitnessProperty";
import { LEAF_SHADER } from "#src/services/scene/constants";
import { DoubleSide } from "three";
import { color, float, mix, normalMap, normalView, positionViewDirection, step, texture, vec3 } from "three/tsl";

// One exported material drawn as the stone's shader writes it into the game's G-buffer (`miHoYo/Scene/Login Base`):
// The diffuse texture tinted by its colour, its normal map, and its mask texture (`SMBE`, read by the inventory) with
// Emission in alpha where the material turns it on. Where its variant compiles the rim glow, by its keyword rather than
// Its toggle's float, the emission grades into the glow's colour at its strength by one less the facing ratio raised to
// Its power, as the program mixes them, and is drawn only where its length reaches the material's emission range, the
// Program writing every glow under it as none. It is laid over a material of the host's, whose colour it multiplies and
// Whose emission it adds to, so it is lit as the host's own stand-ins are: the login's by the game's deferred pass from
// Its stone light, the world's by the ramp with their wetness and rim, and a stand-in and its export differ only in
// What each draws; the mask's smoothness and metal wait on the pass's highlight
export const createWitnessMaterial = (
  sceneMaterial: SceneMaterial,
  nameTextureMap: ReadonlyMap<string, Texture>,
  createMaterial: WitnessMaterialFactory,
): WitnessMaterial => {
  const { colors, floats, keywords, shader, textures } = sceneMaterial;
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
    // The export's own texture cuts its cards: the stand-in's oval would cut them again, and an alpha test on the opacity
    // Node left the cut-out texels drawn, so the cut is a mask node
    if (diffuse) {
      material.opacityNode = null;
      material.alphaTest = 0;
      material.maskNode = texture(diffuse).a.greaterThan(floats[WitnessProperty.Cutoff] ?? 0);
    }
  }
  const normal = getTexture(WitnessProperty.NormalMap);
  if (normal) material.normalNode = normalMap(texture(normal));
  const mask = getTexture(WitnessProperty.DetailMask);
  let emissionNode: Node<"vec3"> = vec3(0);
  if (mask) {
    const maskNode = texture(mask);
    const [emissionRed = 0, emissionGreen = 0, emissionBlue = 0] = colors[WitnessProperty.EmissionColor] ?? [];
    if (floats[WitnessProperty.EmissionType])
      emissionNode = color(emissionRed, emissionGreen, emissionBlue)
        .mul(maskNode.a)
        .mul(floats[WitnessProperty.EmissionStrength] ?? 1);
  }
  if (keywords.includes(WitnessKeyword.RimGlow)) {
    const [rimRed = 0, rimGreen = 0, rimBlue = 0] = colors[WitnessProperty.RimGlowColor] ?? [];
    const facing = float(1).sub(normalView.dot(positionViewDirection).max(0)).max(0);
    const rimNode = facing
      .add(1e-4)
      .pow(floats[WitnessProperty.RimGlowPower] ?? 1)
      .min(1);
    emissionNode = mix(
      emissionNode,
      color(rimRed, rimGreen, rimBlue).mul(floats[WitnessProperty.RimGlowStrength] ?? 0),
      rimNode,
    );
  }
  const glowNode = emissionNode.mul(step(floats[WitnessProperty.EmissionRange] ?? 0, emissionNode.length()));
  material.emissiveNode = emissiveNode ? emissiveNode.add(glowNode) : glowNode;
  return material;
};
