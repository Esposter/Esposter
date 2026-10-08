import type { CharacterMaterialOptions } from "#src/models/character/CharacterMaterialOptions";

import { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import { createRimNode } from "#src/nodes/createRimNode";
import { Color, DoubleSide, FrontSide, SRGBColorSpace } from "three";

// One of a character's materials: three's toon lighting over the world's ramp, its colour the material's diffuse under
// Its texture, and the sky's rim on its lit silhouette. Unlike the environment's toon material it takes no wetness,
// Since the game's characters do not darken in the rain. Every material is blended in the model's own order and writes
// Its depth, as MMD draws one, so a texel the texture leaves clear shows what the materials before it drew; a material
// With both faces drawn is drawn from behind as well, and only one whose edge the file sets is outlined
export const createCharacterMaterial = ({
  lightUniforms,
  pmxMaterial: {
    diffuseColor: [red, green, blue, opacity],
    isDoubleSided,
    isOutlined,
  },
  rampTexture,
  texture,
}: CharacterMaterialOptions): ToonNodeMaterial => {
  const characterMaterial = new ToonNodeMaterial(
    {
      color: new Color().setRGB(red, green, blue, SRGBColorSpace),
      gradientMap: rampTexture,
      map: texture ?? null,
      opacity,
      side: isDoubleSided ? DoubleSide : FrontSide,
      transparent: true,
      // A material left at no opacity, which a pack hides an alternate part with, is not drawn, so its depth hides nothing
      visible: opacity > 0,
    },
    isOutlined,
  );
  characterMaterial.emissiveNode = createRimNode(lightUniforms);
  return characterMaterial;
};
