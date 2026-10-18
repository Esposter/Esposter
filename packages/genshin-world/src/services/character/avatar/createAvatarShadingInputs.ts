import type { AvatarMaterial } from "#src/models/avatar/AvatarMaterial";
import type { AVATAR_TEXTURE_SLOTS } from "#src/services/character/avatar/constants";
import type {
  CharacterMaterialKind,
  CharacterShadingInputs,
  OutlineWidthKnots,
  ShadingRegionColours,
} from "genshin-engine";
import type { Texture, Vector3Tuple, Vector4Tuple } from "three";

import { createFaceDraw, UNIT_OUTLINE_WIDTH_KNOTS } from "genshin-engine";

type AvatarTextureSlot = (typeof AVATAR_TEXTURE_SLOTS)[number]["slot"];

// A switch the material holds as a float, one or zero, or none where it holds no such switch
const readSwitch = (nameFloatMap: ReadonlyMap<string, number>, name: string): boolean | undefined => {
  const value = nameFloatMap.get(name);
  return value === undefined ? undefined : value === 1;
};

// A colour the material holds, as the three components the shading reads, or none where it holds no such colour
const WHITE: Vector3Tuple = [1, 1, 1];
const BLACK: Vector3Tuple = [0, 0, 0];
const readColour = (colors: Readonly<Record<string, Vector4Tuple>>, name: string): undefined | Vector3Tuple => {
  const colour = colors[name];
  return colour && [colour[0], colour[1], colour[2]];
};

// An outline's width knots, the first three of the four the game gives, or none where the material holds no such knots
const readKnots = (colors: Readonly<Record<string, Vector4Tuple>>, name: string): undefined | Vector3Tuple => {
  const knots = colors[name];
  return knots && [knots[0], knots[1], knots[2]];
};

// An outline's width knots as one value, or none where the material names neither. A material that names one of the two
// Keeps the unit knots for the other
const readOutlineWidthKnots = (colors: Readonly<Record<string, Vector4Tuple>>): undefined | OutlineWidthKnots => {
  const depths = readKnots(colors, "_OutlineWidthAdjustZs");
  const scales = readKnots(colors, "_OutlineWidthAdjustScales");
  if (!depths && !scales) return undefined;
  return { depths: depths ?? UNIT_OUTLINE_WIDTH_KNOTS.depths, scales: scales ?? UNIT_OUTLINE_WIDTH_KNOTS.scales };
};

// An outline's offset along the view ray, "_MaxOutlineZOffset" times 0.01, with the block-B flag the vertex's blue is read
// Through (Exact on the form: the flag below a half takes the blue less a half, and the flag at one or above takes one)
const readOutlineOffset = (
  nameFloatMap: ReadonlyMap<string, number>,
): undefined | { blockBChannel: number; size: number } => {
  const size = nameFloatMap.get("_MaxOutlineZOffset");
  return size === undefined
    ? undefined
    : { blockBChannel: nameFloatMap.get("_OutlineOffsetBlockBChannel") ?? 0, size: size * 0.01 };
};

// A value for each region, read by the name the game gives it: the region one's by the bare name and the later regions' by
// Its number after it
const readRegionValues = <T>(
  name: string,
  readValue: (valueName: string) => T,
): Record<keyof ShadingRegionColours, T> => ({
  five: readValue(`${name}5`),
  four: readValue(`${name}4`),
  one: readValue(name),
  three: readValue(`${name}3`),
  two: readValue(`${name}2`),
});

// A material's colours for each region, the fallback where the material holds none
const readRegionColors = (
  colors: Readonly<Record<string, Vector4Tuple>>,
  name: string,
  fallback: Vector3Tuple = WHITE,
): ShadingRegionColours => readRegionValues(name, (valueName) => readColour(colors, valueName) ?? fallback);

// A material's floats for each region, zero where the material holds none
const readRegionFloats = (
  nameFloatMap: ReadonlyMap<string, number>,
  name: string,
): Record<keyof ShadingRegionColours, number> =>
  readRegionValues(name, (valueName) => nameFloatMap.get(valueName) ?? 0);

// A material's shading inputs as the game's own values give them, the values by property name and the textures by the
// Slot they are read from. An input the material does not hold is left out, so the shading takes its default for it
export const createAvatarShadingInputs = (
  { colors, floats }: AvatarMaterial,
  kind: CharacterMaterialKind,
  slotTextureMap: ReadonlyMap<AvatarTextureSlot, Texture>,
): Partial<CharacterShadingInputs> => {
  const color: Vector3Tuple = readColour(colors, "_Color") ?? [1, 1, 1];
  const nameFloatMap = new Map(Object.entries(floats));
  const inputs: Partial<CharacterShadingInputs> = {
    color,
    coolShadowMultiplyColors: readRegionColors(colors, "_CoolShadowMultColor"),
    faceDraw: createFaceDraw({
      flipFactor: nameFloatMap.get("_FaceFlipFactor"),
      rotateOffset: nameFloatMap.get("_FaceMapRotateOffset"),
    }),
    faceMap: slotTextureMap.get("_FaceMapTex"),
    faceSoftness: nameFloatMap.get("_FaceMapSoftness"),
    isCoolShadow: readSwitch(nameFloatMap, "_UseCoolShadowColorOrTex"),
    isLightMapAo: readSwitch(nameFloatMap, "_UseLightMapColorAO"),
    // The game's outline weights its width by each vertex's colour alpha, so its width is read from the vertex, not the material
    isOutlineVertexWeighted: true,
    isVertexAo: readSwitch(nameFloatMap, "_UseVertexColorAO"),
    isVertexRampWidth: readSwitch(nameFloatMap, "_UseVertexRampWidth"),
    kind,
    lightArea: nameFloatMap.get("_LightArea"),
    lightMapTexture: slotTextureMap.get("_LightMapTex"),
    mainTexture: slotTextureMap.get("_MainTex"),
    metalDarkColor: readColour(colors, "_MTMapDarkColor"),
    metalLightColor: readColour(colors, "_MTMapLightColor"),
    metalTexture: slotTextureMap.get("_MTMap"),
    outlineOffset: readOutlineOffset(nameFloatMap),
    outlineRegions: {
      colors: readRegionColors(colors, "_OutlineColor", BLACK),
      intensities: readRegionFloats(nameFloatMap, "_OutLineIntensity"),
    },
    outlineWidthKnots: readOutlineWidthKnots(colors),
    rampTexture: slotTextureMap.get("_PackedShadowRampTex"),
    rampWidth: nameFloatMap.get("_ShadowRampWidth"),
    // A region the material holds no colour for takes the material's own, as a region with no tint of its own does
    regionTints: {
      five: readColour(colors, "_Color5") ?? color,
      four: readColour(colors, "_Color4") ?? color,
      three: readColour(colors, "_Color3") ?? color,
      two: readColour(colors, "_Color2") ?? color,
    },
    // A later region is the lightmap's to select only where the material turns it on, "_UseMaterial2" to "_UseMaterial5"
    regionToggles: {
      five: readSwitch(nameFloatMap, "_UseMaterial5") ?? false,
      four: readSwitch(nameFloatMap, "_UseMaterial4") ?? false,
      three: readSwitch(nameFloatMap, "_UseMaterial3") ?? false,
      two: readSwitch(nameFloatMap, "_UseMaterial2") ?? false,
    },
    shadowMultiplyColors: readRegionColors(colors, "_FirstShadowMultColor"),
    shininess: nameFloatMap.get("_Shininess"),
    specularColor: readColour(colors, "_SpecularColor"),
    specularMultiplier: nameFloatMap.get("_SpecMulti"),
  };
  // A key left undefined would override the shading's default with nothing, so only the keys the material holds stay
  return Object.fromEntries(
    Object.entries(inputs).filter(([, value]) => value !== undefined),
  ) as Partial<CharacterShadingInputs>;
};
