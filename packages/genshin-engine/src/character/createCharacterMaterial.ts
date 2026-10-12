import type { CharacterMaterialOptions } from "#src/models/character/CharacterMaterialOptions";

import { createSpecularNode } from "#src/character/createSpecularNode";
import { getSharedToonRamp } from "#src/character/getSharedToonRamp";
import { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import { createRimNode } from "#src/nodes/createRimNode";
import { Color, DoubleSide, FrontSide, SRGBColorSpace } from "three";
import { diffuseColor, materialColor, matcapUV, texture, vec3 } from "three/tsl";

// One of a character's materials, as its file sets it: its diffuse colour under its texture, lit on the toon ramp its file
// Names (MMD's shared ramps, or a texture of the model's), and the sun's specular highlight and the material's ambient
// Light on top. A sphere map multiplies or adds to the colour as its file says, and the sky's rim lights its lit
// Silhouette. Unlike the environment's toon material it takes no wetness, since the game's characters do not darken in
// The rain. Every material is blended in the model's own order and writes its depth, as MMD draws one, so a texel the
// Texture leaves clear shows what the materials before it drew; a material with both faces drawn is drawn from behind as
// Well, and only one whose edge the file sets is outlined, in that edge's colour and width
export const createCharacterMaterial = ({
  lightUniforms,
  pmxMaterial: {
    ambientColor: [ambientRed, ambientGreen, ambientBlue],
    diffuseColor: [red, green, blue, opacity],
    edgeColor,
    edgeSize,
    isDoubleSided,
    isOutlined,
    isToonShared,
    specularColor,
    specularity,
    sphereMode,
    toonIndex,
  },
  rampTexture,
  sphereTexture,
  texture: diffuseTexture,
  toonTexture,
}: CharacterMaterialOptions): ToonNodeMaterial => {
  const characterMaterial = new ToonNodeMaterial(
    {
      color: new Color().setRGB(red, green, blue, SRGBColorSpace),
      gradientMap: (isToonShared ? getSharedToonRamp(toonIndex) : toonTexture) ?? rampTexture,
      map: diffuseTexture ?? null,
      opacity,
      side: isDoubleSided ? DoubleSide : FrontSide,
      transparent: true,
      // A material left at no opacity, which a pack hides an alternate part with, is not drawn, so its depth hides nothing
      visible: opacity > 0,
    },
    isOutlined,
    isOutlined ? { color: edgeColor, size: edgeSize } : undefined,
  );
  if (sphereTexture && sphereMode !== PmxSphereMode.Disabled && sphereMode !== PmxSphereMode.AdditionalUv) {
    characterMaterial.sphereMap = sphereTexture;
    const sphere = texture(sphereTexture, matcapUV).rgb;
    characterMaterial.colorNode =
      sphereMode === PmxSphereMode.Multiply ? materialColor.mul(sphere) : materialColor.add(sphere);
  }
  characterMaterial.emissiveNode = createRimNode(lightUniforms)
    .add(createSpecularNode(lightUniforms, specularColor, specularity))
    .add(diffuseColor.rgb.mul(vec3(ambientRed, ambientGreen, ambientBlue)));
  return characterMaterial;
};
