import type { CharacterMaterialOptions } from "#src/models/character/CharacterMaterialOptions";

import { createCharacterShadingInputs } from "#src/character/createCharacterShadingInputs";
import { getSharedToonRamp } from "#src/character/getSharedToonRamp";
import { createCharacterShadingNode } from "#src/character/shading/createCharacterShadingNode";
import { createOutlineColorNode } from "#src/character/shading/createOutlineColorNode";
import { getToneColour } from "#src/character/shading/getToneColour";
import { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import { RampLayout } from "#src/models/character/RampLayout";
import { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import { DoubleSide, FrontSide, Vector3 } from "three";
import { float, texture, uv, vec4 } from "three/tsl";

// One of a character's materials, shaded as the game's own character shader draws a body, its inputs taken from the PMX
// Material: its diffuse is the main texture and its colour, its toon the ramp (its own read up its one column, a shared
// One across its row), its sphere the metal map, and its specular and edge carry over. The regions and the lightmap
// Take their defaults, as the shading page's inputs table sets out. A material is drawn opaque, writing its depth,
// Unless its diffuse alpha is below one or its texture has clear texels, and then it is blended and drawn from both
// Faces. Every opaque material is outlined, as the game outlines every character: one whose edge the file sets in that
// Edge's colour and width, the colour tone-mapped as the body's is, and one whose file sets none, as an official
// Release's do, by the world's own outline. A material left at no opacity is not drawn
export const createCharacterMaterial = ({
  isTextureTransparent,
  lightUniforms,
  pmxMaterial: {
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
  shadingInputs: gameShadingInputs,
  sphereTexture,
  texture: diffuseTexture,
  toonTexture,
}: CharacterMaterialOptions): ToonNodeMaterial => {
  const isTransparent = opacity !== 1 || isTextureTransparent;
  const color: [number, number, number] = [red, green, blue];
  const packToonTexture = isToonShared ? undefined : toonTexture;
  const shadingInputs = createCharacterShadingInputs({
    color,
    mainTexture: diffuseTexture,
    metalTexture: sphereTexture && sphereMode !== PmxSphereMode.Disabled ? sphereTexture : undefined,
    // A pack's own toon is one column read down its rows, where the shared ramps and the world's are one row across
    rampLayout: packToonTexture ? RampLayout.Vertical : RampLayout.Horizontal,
    rampTexture: packToonTexture ?? (isToonShared ? getSharedToonRamp(toonIndex) : undefined) ?? rampTexture,
    shininess: specularity,
    specularColor,
    ...gameShadingInputs,
  });
  const toned = getToneColour(
    new Vector3(red * edgeColor[0], green * edgeColor[1], blue * edgeColor[2]),
    shadingInputs.desaturateScale,
    shadingInputs.contrastScale,
  );
  const { outlineRegions } = shadingInputs;
  const alpha = diffuseTexture ? texture(diffuseTexture, uv()).a.mul(opacity) : float(opacity);
  const characterMaterial = new ToonNodeMaterial(
    {
      opacity,
      side: isDoubleSided || isTransparent ? DoubleSide : FrontSide,
      transparent: isTransparent,
      // A material left at no opacity, which a pack hides an alternate part with, is not drawn, so its depth hides nothing
      visible: opacity > 0,
    },
    isOutlined || !isTransparent,
    isOutlined
      ? {
          // A game model's outline is coloured per pixel by its regions, and a pack's in its edge's colour
          color: outlineRegions
            ? vec4(createOutlineColorNode(shadingInputs, outlineRegions), edgeColor[3])
            : [toned.x, toned.y, toned.z, edgeColor[3]],
          isVertexWeighted: shadingInputs.isOutlineVertexWeighted,
          offset: shadingInputs.outlineOffset,
          size: edgeSize,
          widthKnots: { depths: shadingInputs.outlineDepths, scales: shadingInputs.outlineScales },
        }
      : undefined,
  );
  // The shading is the game's own, so the material takes no three lighting, and its output is the shaded colour
  characterMaterial.lights = false;
  characterMaterial.outputNode = vec4(createCharacterShadingNode(shadingInputs, lightUniforms), alpha);
  if (sphereTexture && sphereMode !== PmxSphereMode.Disabled) characterMaterial.sphereMap = sphereTexture;
  return characterMaterial;
};
