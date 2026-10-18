import type { CharacterMaterialKind } from "#src/models/character/CharacterMaterialKind";
import type { FaceDraw } from "#src/models/character/FaceDraw";
import type { OutlineRegions } from "#src/models/character/OutlineRegions";
import type { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import type { RampLayout } from "#src/models/character/RampLayout";
import type { ShadingRegionColours } from "#src/models/character/ShadingRegionColours";
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
  // Each region's cool shadow colour, "_CoolShadowMultColor" and its later regions, mixed in where the cool shadow is on
  coolShadowMultiplyColors: ShadingRegionColours;
  // The shadow ramp is read as its cool row too, mixed in by the cool tone, where the cool shadow is on
  coolShadowTone: number;
  desaturateScale: number;
  // The emission's colour and scale, "_EmissionColor_MHY" and "_EmissionScaler"
  emissionColor: Vector3Tuple;
  emissionScaler: number;
  // The face's draw, its threshold and flip set each frame from the light, and the face map, read by the face kind, with
  // Its softness "_FaceMapSoftness"
  faceDraw: FaceDraw;
  faceMap?: Texture;
  faceSoftness: number;
  // Whether a cool shadow is on, "_CoolShadowColorOrTex"
  isCoolShadow: boolean;
  // Whether the emission is drawn where the main texture's alpha is, "_MainTexAlphaUse" set to two, and none elsewhere
  isEmissionFromAlpha: boolean;
  // Whether the lightmap's green is the threshold's occlusion, "_UseLightMapColorAO"
  isLightMapAo: boolean;
  // Whether the vertex colour's alpha scales the outline's width, as the game's outline reads it
  isOutlineVertexWeighted: boolean;
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
  // The outline's offset along the view ray, from the game's "_MaxOutlineZOffset", where a game model has one
  outlineOffset?: { blockBChannel: number; size: number };
  // A game model's outline colours by region, read per pixel; a pack's outline is its edge's one colour
  outlineRegions?: OutlineRegions;
  outlineScales: Vector3Tuple;
  // The packed shadow ramp "_PackedShadowRampTex", read as its row, and the layout it is read by: the game's and the
  // World's shared ramps are rows, and a pack's own toon is a column
  rampLayout: RampLayout;
  rampTexture: Texture;
  rampWidth: number;
  regionTints: Record<"five" | "four" | "three" | "two", Vector3Tuple>;
  // A PMX material's sphere map, laid over its diffuse as MMD lays it, multiplied or added, before the lit colour. It is not
  // The metal map: a PMX file has no lightmap for the metal gate to read, so the sphere never reaches that branch
  sphere?: { mode: PmxSphereMode.Add | PmxSphereMode.Multiply; texture: Texture };
  // The region the lightmap's alpha selects, and each region's own tint
  regionToggles: ShadingRegionToggles;
  // Each region's first shadow colour, "_FirstShadowMultColor" and its later regions, the colour a face in shadow keeps
  shadowMultiplyColors: ShadingRegionColours;
  // The specular's colour, power and weights, "_SpecularColor", "_Shininess", "_SpecMulti" and "_SpecualrInShaow"
  shininess: number;
  specularColor: Vector3Tuple;
  specularInShadow: number;
  specularMultiplier: number;
  vertexAo: number;
  vertexRampWidth: number;
}
