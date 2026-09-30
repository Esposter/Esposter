import type { SceneMaterial } from "genshin-engine";
import type { Texture } from "three";

import { Color } from "three";

import { readTextureMean } from "#parity/witness/readTextureMean";
import { WitnessProperty } from "#parity/witness/WitnessProperty";
import { WitnessShading } from "#parity/witness/WitnessShading";
import { color, float, texture } from "three/tsl";
import { MeshStandardNodeMaterial } from "three/webgpu";

// One exported material drawn as the physically based shader its values name: the diffuse texture tinted by its
// Colour, its normal map, and its mask texture (`SMBE`, read by the inventory) as smoothness in red scaled by the gloss
// Scale, metalness in green, and emission in alpha where the material turns it on. This is the witness's hypothesis of
// The stone's shader, whose own programs AnimeStudio cannot export to confirm it. Flat, the material keeps its values
// And draws its diffuse texture's mean colour with no normal map
export const createWitnessMaterial = (
  { colors, floats, textures }: SceneMaterial,
  nameTextureMap: ReadonlyMap<string, Texture>,
  shading: WitnessShading,
): MeshStandardNodeMaterial => {
  const isFlat = shading === WitnessShading.Flat;
  const material = new MeshStandardNodeMaterial();
  const getTexture = (slot: WitnessProperty): Texture | undefined => {
    const slotTexture = textures[slot];
    return slotTexture ? nameTextureMap.get(slotTexture.name) : undefined;
  };
  const [red = 1, green = 1, blue = 1] = colors[WitnessProperty.Color] ?? [];
  const diffuse = getTexture(WitnessProperty.MainTexture);
  const tint = color(red, green, blue);
  if (diffuse)
    material.colorNode = isFlat
      ? color(readTextureMean(diffuse).multiply(new Color(red, green, blue)))
      : texture(diffuse).rgb.mul(tint);
  else material.colorNode = tint;
  const normal = getTexture(WitnessProperty.NormalMap);
  if (normal && !isFlat) material.normalMap = normal;
  const mask = getTexture(WitnessProperty.DetailMask);
  if (mask) {
    const maskNode = texture(mask);
    material.roughnessNode = float(1).sub(maskNode.r.mul(floats[WitnessProperty.GlossMapScale] ?? 1));
    material.metalnessNode = maskNode.g;
    const [emissionRed = 0, emissionGreen = 0, emissionBlue = 0] = colors[WitnessProperty.EmissionColor] ?? [];
    if (floats[WitnessProperty.EmissionType])
      material.emissiveNode = color(emissionRed, emissionGreen, emissionBlue)
        .mul(maskNode.a)
        .mul(floats[WitnessProperty.EmissionStrength] ?? 1);
  }
  return material;
};
