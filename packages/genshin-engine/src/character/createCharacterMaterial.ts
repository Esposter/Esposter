import type { CharacterMaterialOptions } from "#src/models/character/CharacterMaterialOptions";

import { createCharacterShadingInputs } from "#src/character/createCharacterShadingInputs";
import { getSharedToonRamp } from "#src/character/getSharedToonRamp";
import { createCharacterShadingNode } from "#src/character/shading/createCharacterShadingNode";
import { getToneColour } from "#src/character/shading/getToneColour";
import { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import { ToonNodeMaterial } from "#src/models/nodes/ToonNodeMaterial";
import { DoubleSide, FrontSide, Vector3 } from "three";
import { float, texture, uv, vec4 } from "three/tsl";

// One of a character's materials, shaded as the game's own character shader draws a body, its inputs taken from the PMX
// Material: its diffuse is the main texture and its colour, its toon the ramp read as one row, its sphere the metal map,
// And its specular and edge carry over. The regions and the lightmap take their defaults, as the shading page's inputs
// Table sets out. A material is drawn opaque, writing its depth, unless its diffuse alpha is below one or its texture has
// Clear texels, and then it is blended and drawn from both faces. A material whose edge the file sets is outlined in that
// Edge's colour and width, the colour tone-mapped as the body's is, and a material left at no opacity is not drawn
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
  sphereTexture,
  texture: diffuseTexture,
  toonTexture,
}: CharacterMaterialOptions): ToonNodeMaterial => {
  const isTransparent = opacity !== 1 || isTextureTransparent;
  const color: [number, number, number] = [red, green, blue];
  const shadingInputs = createCharacterShadingInputs({
    color,
    mainTexture: diffuseTexture,
    metalTexture: sphereTexture && sphereMode !== PmxSphereMode.Disabled ? sphereTexture : undefined,
    rampTexture: (isToonShared ? getSharedToonRamp(toonIndex) : toonTexture) ?? rampTexture,
    shininess: specularity,
    specularColor,
  });
  const toned = getToneColour(
    new Vector3(red * edgeColor[0], green * edgeColor[1], blue * edgeColor[2]),
    shadingInputs.desaturateScale,
    shadingInputs.contrastScale,
  );
  const alpha = diffuseTexture ? texture(diffuseTexture, uv()).a.mul(opacity) : float(opacity);
  const characterMaterial = new ToonNodeMaterial(
    {
      opacity,
      side: isDoubleSided || isTransparent ? DoubleSide : FrontSide,
      transparent: isTransparent,
      // A material left at no opacity, which a pack hides an alternate part with, is not drawn, so its depth hides nothing
      visible: opacity > 0,
    },
    isOutlined,
    isOutlined
      ? {
          color: [toned.x, toned.y, toned.z, edgeColor[3]],
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
