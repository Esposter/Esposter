import type { AvatarMaterial } from "#src/models/avatar/AvatarMaterial";
import type { AVATAR_TEXTURE_SLOTS } from "#src/services/character/avatar/constants";
import type { CharacterMaterialKind, CharacterShadingInputs } from "genshin-engine";
import type { Texture, Vector3Tuple, Vector4Tuple } from "three";

import { createFaceDraw } from "genshin-engine";

type AvatarTextureSlot = (typeof AVATAR_TEXTURE_SLOTS)[number];

// A switch the material holds as a float, one or zero, or none where it holds no such switch
const readSwitch = (nameFloatMap: ReadonlyMap<string, number>, name: string): boolean | undefined => {
  const value = nameFloatMap.get(name);
  return value === undefined ? undefined : value === 1;
};

// A colour the material holds, as the three components the shading reads, or none where it holds no such colour
const readColour = (colors: Readonly<Record<string, Vector4Tuple>>, name: string): undefined | Vector3Tuple => {
  const colour = colors[name];
  return colour && [colour[0], colour[1], colour[2]];
};

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
    faceDraw: createFaceDraw({
      flipFactor: nameFloatMap.get("_FaceFlipFactor"),
      rotateOffset: nameFloatMap.get("_FaceMapRotateOffset"),
    }),
    faceMap: slotTextureMap.get("_FaceMapTex"),
    faceSoftness: nameFloatMap.get("_FaceMapSoftness"),
    isLightMapAo: readSwitch(nameFloatMap, "_UseLightMapColorAO"),
    isVertexAo: readSwitch(nameFloatMap, "_UseVertexColorAO"),
    isVertexRampWidth: readSwitch(nameFloatMap, "_UseVertexRampWidth"),
    kind,
    lightArea: nameFloatMap.get("_LightArea"),
    lightMapTexture: slotTextureMap.get("_LightMapTex"),
    mainTexture: slotTextureMap.get("_MainTex"),
    metalDarkColor: readColour(colors, "_MTMapDarkColor"),
    metalLightColor: readColour(colors, "_MTMapLightColor"),
    metalTexture: slotTextureMap.get("_MTMap"),
    rampTexture: slotTextureMap.get("_PackedShadowRampTex"),
    // A region the material holds no colour for takes the material's own, as a region with no tint of its own does
    regionTints: {
      five: readColour(colors, "_Color5") ?? color,
      four: readColour(colors, "_Color4") ?? color,
      three: readColour(colors, "_Color3") ?? color,
      two: readColour(colors, "_Color2") ?? color,
    },
    shininess: nameFloatMap.get("_Shininess"),
    specularColor: readColour(colors, "_SpecularColor"),
    specularMultiplier: nameFloatMap.get("_SpecMulti"),
  };
  // A key left undefined would override the shading's default with nothing, so only the keys the material holds stay
  return Object.fromEntries(
    Object.entries(inputs).filter(([, value]) => value !== undefined),
  ) as Partial<CharacterShadingInputs>;
};
