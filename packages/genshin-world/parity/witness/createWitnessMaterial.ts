import type { SceneMaterial } from "genshin-engine";
import type { Texture } from "three";
import type { Node } from "three/webgpu";

import { WitnessProperty } from "#parity/witness/WitnessProperty";
import { loginStoneLight } from "#src/services/login/scene/loginStoneLight";
import { StoneNodeMaterial } from "genshin-engine";
import { color, float, mix, normalMap, normalView, positionViewDirection, texture, vec3 } from "three/tsl";

// One exported material drawn as the stone's shader writes it into the game's G-buffer (`miHoYo/Scene/Login Base`):
// The diffuse texture tinted by its colour, its normal map, and its mask texture (`SMBE`, read by the inventory) with
// Emission in alpha where the material turns it on. The emission grades into the rim glow's colour at its strength by
// One less the facing ratio raised to its power, as the program mixes them. It is lit as our stone is, by the game's
// Deferred pass from the login's stone light, so a stand-in and its export differ only in what each draws; the mask's
// Smoothness and metal wait on the pass's highlight
export const createWitnessMaterial = (
  { colors, floats, textures }: SceneMaterial,
  nameTextureMap: ReadonlyMap<string, Texture>,
): StoneNodeMaterial => {
  const material = new StoneNodeMaterial(loginStoneLight);
  const getTexture = (slot: WitnessProperty): Texture | undefined => {
    const slotTexture = textures[slot];
    return slotTexture ? nameTextureMap.get(slotTexture.name) : undefined;
  };
  const [red = 1, green = 1, blue = 1] = colors[WitnessProperty.Color] ?? [];
  const diffuse = getTexture(WitnessProperty.MainTexture);
  const tint = color(red, green, blue);
  material.colorNode = diffuse ? texture(diffuse).rgb.mul(tint) : tint;
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
  if (floats[WitnessProperty.EnableRimGlow]) {
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
  material.emissiveNode = emissionNode;
  return material;
};
