import type { CharacterMaterialKind } from "#src/models/character/CharacterMaterialKind";
import type { ShadingRegionToggles } from "#src/models/character/ShadingRegionToggles";
import type { Texture, Vector3Tuple } from "three";

// The inputs the character shading reads, in the shape of the Inputs table on the shading page. Every one takes its default
// Where nothing supplies it, as the table sets out, so a material draws whatever its file holds
export interface CharacterShadingInputs {
  // The brightness of the main light, "_ES_CharacterMainLightBrightness"
  brightness: number;
  // The material's colour, "_Color", the tint of region one
  color: Vector3Tuple;
  // The contrast and desaturation of the output tone, "_ContrastScale" and "_DesaturateScale"
  contrastScale: number;
  // The shadow ramp is read as its cool row too, mixed in by the cool tone, where the cool shadow is on
  coolShadowTone: number;
  desaturateScale: number;
  // The emission's colour and scale, "_EmissionColor_MHY" and "_EmissionScaler"
  emissionColor: Vector3Tuple;
  emissionScaler: number;
  // The face map, read by the face kind, and its softness "_FaceMapSoftness"
  faceMap?: Texture;
  faceSoftness: number;
  // Whether a cool shadow is on, "_CoolShadowColorOrTex"
  isCoolShadow: boolean;
  // Whether the lightmap's green is the threshold's occlusion, "_UseLightMapColorAO"
  isLightMapAo: boolean;
  // Whether the vertex's ambient occlusion scales the threshold, and its value, "_UseVertexColorAO"
  isVertexAo: boolean;
  // Whether the vertex's ramp weight scales the band, "_UseVertexRampWidth", and its value
  isVertexRampWidth: boolean;
  kind: CharacterMaterialKind;
  // The ramp's light area and band width, "_LightArea" and "_ShadowRampWidth"
  lightArea: number;
  // The lightmap "_LightMapTex", whose red is the metal mask and the specular weight, green the shadow threshold, blue the
  // Specular gate and alpha the region
  lightMapTexture?: Texture;
  // The main texture "_MainTex"
  mainTexture?: Texture;
  // The matcap read where the metal mask holds, "_MTMap", and its two colours
  metalDarkColor: Vector3Tuple;
  metalLightColor: Vector3Tuple;
  metalTexture?: Texture;
  // The outline's width knots, "_OutlineWidthAdjustZs" and "_OutlineWidthAdjustScales"
  outlineDepths: Vector3Tuple;
  outlineScales: Vector3Tuple;
  // The packed shadow ramp "_PackedShadowRampTex", read as its row
  rampTexture: Texture;
  rampWidth: number;
  regionTints: Record<"five" | "four" | "three" | "two", Vector3Tuple>;
  // The region the lightmap's alpha selects, and each region's own tint
  regionToggles: ShadingRegionToggles;
  // The specular's colour, power and weights, "_SpecularColor", "_Shininess", "_SpecMulti" and "_SpecualrInShaow"
  shininess: number;
  specularColor: Vector3Tuple;
  specularInShadow: number;
  specularMultiplier: number;
  vertexAo: number;
  vertexRampWidth: number;
}
