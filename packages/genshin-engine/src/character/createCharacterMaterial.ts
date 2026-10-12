import type { CharacterMaterialOptions } from "#src/models/character/CharacterMaterialOptions";

import { createSpecularNode } from "#src/character/createSpecularNode";
import { getSharedToonRamp } from "#src/character/getSharedToonRamp";
import { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import { createRimNode } from "#src/nodes/createRimNode";
import { Color, DoubleSide, FrontSide, SRGBColorSpace } from "three";
import { attribute, diffuseColor, materialColor, normalView, texture, uv, vec2, vec3 } from "three/tsl";

// One of a character's materials, as its file sets it: its diffuse colour under its texture, lit on the toon ramp its file
// Names (MMD's shared ramps, or a texture of the model's), and the sun's specular highlight and the material's ambient
// Light on top. A sphere map multiplies or adds to the colour as its file says, and the sky's rim lights its lit
// Silhouette. Unlike the environment's toon material it takes no wetness, since the game's characters do not darken in
// The rain. A material is drawn opaque, writing its depth, unless its diffuse alpha is below one or its texture has clear
// Texels, and then it is blended and drawn from both faces. Only a material
// Whose edge the file sets is outlined, in that edge's colour and width. Its ambient is tinted by its diffuse colour, the
// Texture included, so a material lit by its ambient keeps its own colour rather than washing out to the light's
export const createCharacterMaterial = ({
  isTextureTransparent,
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
  const isTransparent = opacity !== 1 || isTextureTransparent;
  const characterMaterial = new ToonNodeMaterial(
    {
      color: new Color().setRGB(red, green, blue, SRGBColorSpace),
      gradientMap: (isToonShared ? getSharedToonRamp(toonIndex) : toonTexture) ?? rampTexture,
      map: diffuseTexture ?? null,
      opacity,
      side: isDoubleSided || isTransparent ? DoubleSide : FrontSide,
      transparent: isTransparent,
      // A material left at no opacity, which a pack hides an alternate part with, is not drawn, so its depth hides nothing
      visible: opacity > 0,
    },
    isOutlined,
    isOutlined ? { color: edgeColor, size: edgeSize } : undefined,
  );
  if (sphereTexture && sphereMode !== PmxSphereMode.Disabled) {
    characterMaterial.sphereMap = sphereTexture;
    // MMD reads its sphere map through the normal's view-space x and y, the file's top the surface that faces up, and a
    // Sub-texture through the vertex's own coordinates. The colour node replaces three's, the material colour under its
    // Texture, so that texture is drawn into it here
    const sphereUv = vec2(normalView.x, normalView.y.negate()).mul(0.5).add(0.5);
    const sphere = texture(
      sphereTexture,
      sphereMode === PmxSphereMode.AdditionalUv ? attribute("subUv", "vec2") : sphereUv,
    ).rgb;
    const diffuse = diffuseTexture ? materialColor.mul(texture(diffuseTexture, uv()).rgb) : materialColor;
    characterMaterial.colorNode = sphereMode === PmxSphereMode.Add ? diffuse.add(sphere) : diffuse.mul(sphere);
  }
  characterMaterial.emissiveNode = createRimNode(lightUniforms)
    .add(createSpecularNode(lightUniforms, specularColor, specularity))
    .add(diffuseColor.rgb.mul(vec3(ambientRed, ambientGreen, ambientBlue)));
  return characterMaterial;
};
