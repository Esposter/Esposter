import type { CharacterShadingInputs } from "#src/models/character/CharacterShadingInputs";
import type { Texture, Vector3Tuple } from "three";

import { DEFAULT_LIGHT_AREA, DEFAULT_RAMP_WIDTH, UNIT_OUTLINE_WIDTH_KNOTS } from "#src/character/shading/constants";
import { createFaceDraw } from "#src/character/shading/updateFaceDraw";
import { CharacterMaterialKind } from "#src/models/character/CharacterMaterialKind";
import { RampLayout } from "#src/models/character/RampLayout";

// The inputs of a material the caller supplies, each one it has; every other takes the default the page sets out
type CharacterShadingOverrides = Partial<CharacterShadingInputs> & { rampTexture: Texture };

const WHITE: Vector3Tuple = [1, 1, 1];
const BLACK: Vector3Tuple = [0, 0, 0];

// A material's shading inputs with each default filled in. A region with no tint of its own takes the material's colour,
// And the default lightmap of a material with none is the flat one the shading page's table proposes
export const createCharacterShadingInputs = (overrides: CharacterShadingOverrides): CharacterShadingInputs => {
  const color = overrides.color ?? WHITE;
  return {
    brightness: 1,
    color,
    contrastScale: 0,
    coolShadowMultiplyColors: { five: WHITE, four: WHITE, one: WHITE, three: WHITE, two: WHITE },
    coolShadowTone: 0,
    desaturateScale: 0,
    emissionColor: BLACK,
    emissionScaler: 1,
    faceDraw: createFaceDraw(),
    faceSoftness: 0,
    isCoolShadow: false,
    isEmissionFromAlpha: false,
    isLightMapAo: true,
    isOutlineVertexWeighted: false,
    isVertexAo: false,
    isVertexRampWidth: false,
    kind: CharacterMaterialKind.Body,
    lightArea: DEFAULT_LIGHT_AREA,
    metalDarkColor: BLACK,
    metalLightColor: WHITE,
    outlineWidthKnots: UNIT_OUTLINE_WIDTH_KNOTS,
    rampLayout: RampLayout.Horizontal,
    rampWidth: DEFAULT_RAMP_WIDTH,
    regionTints: { five: color, four: color, three: color, two: color },
    regionToggles: { five: false, four: false, three: false, two: false },
    shadowMultiplyColors: { five: WHITE, four: WHITE, one: WHITE, three: WHITE, two: WHITE },
    shininess: 1,
    specularColor: BLACK,
    specularInShadow: 1,
    specularMultiplier: 1,
    vertexAo: 1,
    vertexRampWidth: 1,
    ...overrides,
  };
};
