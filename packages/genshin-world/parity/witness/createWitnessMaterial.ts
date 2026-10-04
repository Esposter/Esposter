import type { SceneMaterial } from "genshin-engine";
import type { Texture } from "three";
import type { Node } from "three/webgpu";

import { WitnessProperty } from "#parity/witness/WitnessProperty";
import { color, float, mix, normalView, positionViewDirection, texture, vec3 } from "three/tsl";
import { MeshStandardNodeMaterial } from "three/webgpu";

// One exported material drawn as the stone's shader writes it into the game's G-buffer (`miHoYo/Scene/Login Base`):
// The diffuse texture tinted by its colour, its normal map, and its mask texture (`SMBE`, read by the inventory) as
// Smoothness in red scaled by the gloss scale, metalness in green, and emission in alpha where the material turns it
// On. The emission grades into the rim glow's colour at its strength by one less the facing ratio raised to its power,
// As the program mixes them. Lighting is the game's deferred pass, which the engine's physically based lighting stands
// In for.
export const createWitnessMaterial = (
  { colors, floats, textures }: SceneMaterial,
  nameTextureMap: ReadonlyMap<string, Texture>,
): MeshStandardNodeMaterial => {
  const material = new MeshStandardNodeMaterial();
  const getTexture = (slot: WitnessProperty): Texture | undefined => {
    const slotTexture = textures[slot];
    return slotTexture ? nameTextureMap.get(slotTexture.name) : undefined;
  };
  const [red = 1, green = 1, blue = 1] = colors[WitnessProperty.Color] ?? [];
  const diffuse = getTexture(WitnessProperty.MainTexture);
  const tint = color(red, green, blue);
  material.colorNode = diffuse ? texture(diffuse).rgb.mul(tint) : tint;
  const normal = getTexture(WitnessProperty.NormalMap);
  if (normal) material.normalMap = normal;
  const mask = getTexture(WitnessProperty.DetailMask);
  let emissionNode: Node<"vec3"> = vec3(0);
  if (mask) {
    const maskNode = texture(mask);
    material.roughnessNode = float(1).sub(maskNode.r.mul(floats[WitnessProperty.GlossMapScale] ?? 1));
    material.metalnessNode = maskNode.g;
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
