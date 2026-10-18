import type { CharacterShadingInputs } from "#src/models/character/CharacterShadingInputs";
import type { ShadingRegionColours } from "#src/models/character/ShadingRegionColours";
import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { Vector3Tuple } from "three";
import type { Node } from "three/webgpu";

import {
  COOL_RAMP_ROW_BASE,
  EMISSION_ALPHA_FLOOR,
  FLAT_LIGHT_MAP,
  HALF_LAMBERT_OFFSET,
  HALF_LAMBERT_SCALE,
  MINIMUM_RAMP_WIDTH_VERTEX,
  RAMP_ROW_BASE,
  RAMP_ROW_STEP,
} from "#src/character/shading/constants";
import { createFaceShadeNode } from "#src/character/shading/createFaceShadeNode";
import { createRampColumnNode } from "#src/character/shading/createRampColumnNode";
import { createRampUvNode } from "#src/character/shading/createRampUvNode";
import { createShadingRegionNode } from "#src/character/shading/createShadingRegionNode";
import { createToneNode } from "#src/character/shading/createToneNode";
import { createToonThresholdNode } from "#src/character/shading/createToonThresholdNode";
import { selectRegionNode } from "#src/character/shading/selectRegionNode";
import { CharacterMaterialKind } from "#src/models/character/CharacterMaterialKind";
import { PmxSphereMode } from "#src/models/character/PmxSphereMode";
import {
  cameraViewMatrix,
  float,
  max,
  mix,
  normalView,
  positionViewDirection,
  select,
  step,
  texture,
  uv,
  vec2,
  vec3,
  vec4,
} from "three/tsl";

const toVec3 = ([red, green, blue]: Vector3Tuple): Node<"vec3"> => vec3(red, green, blue);

// The diffuse with a PMX sphere laid over it as MMD lays it, multiplied or added, read through the normal's view-space x
// And negated y, the file's top the surface that faces up
const laySphere = (diffuse: Node<"vec3">, sphere: NonNullable<CharacterShadingInputs["sphere"]>): Node<"vec3"> => {
  const sample = texture(sphere.texture, vec2(normalView.x, normalView.y.negate()).mul(0.5).add(0.5)).rgb;
  return sphere.mode === PmxSphereMode.Add ? diffuse.add(sample) : diffuse.mul(sample);
};

// A colour by the region a pixel is in: the first region's colour, unless a later region's is selected
const selectRegionColor = (region: Node<"float">, colors: ShadingRegionColours): Node<"vec3"> =>
  selectRegionNode(region, (regionName) => toVec3(colors[regionName]));

// The shadow colour a pixel is shaded by: its region's first shadow colour, mixed toward its cool shadow colour by the
// Cool tone where the cool shadow is on
const createShadowMultiplyNode = (region: Node<"float">, inputs: CharacterShadingInputs): Node<"vec3"> => {
  const firstShadow = selectRegionColor(region, inputs.shadowMultiplyColors);
  if (!inputs.isCoolShadow) return firstShadow;
  return mix(firstShadow, selectRegionColor(region, inputs.coolShadowMultiplyColors), inputs.coolShadowTone);
};

// The character's colour as the game's shader draws it, the TSL form of the shading page: the region's tint on the main
// Texture, lit on the shadow ramp row of its region, its emission lerped in by the main texture's alpha, its specular
// Step, the metal matcap where the lightmap's red passes the gate, and the output tone. A face is shaded by its face map
// In place of the ramp, and a hair takes the body's path without the metal branch
export const createCharacterShadingNode = (
  inputs: CharacterShadingInputs,
  { lightColor, sunDirection }: Pick<LightUniforms, "lightColor" | "sunDirection">,
): Node<"vec3"> => {
  const { brightness, color, emissionColor, emissionScaler, kind, metalTexture, regionTints, regionToggles } = inputs;
  const sunDirectionView = cameraViewMatrix.mul(vec4(sunDirection, 0)).xyz.normalize();
  const [flatRed, flatGreen, flatBlue, flatAlpha] = FLAT_LIGHT_MAP;
  const lightMap = inputs.lightMapTexture
    ? texture(inputs.lightMapTexture, uv())
    : vec4(flatRed, flatGreen, flatBlue, flatAlpha);
  const region = createShadingRegionNode(lightMap.a, regionToggles);
  const tint = selectRegionColor(region, { ...regionTints, one: color });
  const mainSample = inputs.mainTexture ? texture(inputs.mainTexture, uv()) : vec4(1);
  const diffuseColour = mainSample.rgb.mul(tint);
  const materialColour = inputs.sphere ? laySphere(diffuseColour, inputs.sphere) : diffuseColour;

  const sunTerm = normalView.dot(sunDirectionView).mul(HALF_LAMBERT_SCALE).add(HALF_LAMBERT_OFFSET);
  const threshold = createToonThresholdNode({
    isLightMapAo: inputs.isLightMapAo,
    isVertexAo: inputs.isVertexAo,
    lightMapGreen: lightMap.g,
    sunTerm,
    vertexAo: inputs.vertexAo,
  });
  const rampWidth = inputs.isVertexRampWidth
    ? max(float(2).mul(inputs.vertexRampWidth), float(MINIMUM_RAMP_WIDTH_VERTEX)).mul(inputs.rampWidth)
    : float(inputs.rampWidth);
  const column = createRampColumnNode(threshold, inputs.lightArea, rampWidth);
  // A region's row is its base plus a step per region past one, and the ramp's layout reads it as its own coordinate
  const sampleRamp = (rowBase: number): Node<"vec3"> =>
    texture(
      inputs.rampTexture,
      createRampUvNode(inputs.rampLayout, column, float(rowBase).add(region.sub(1).mul(RAMP_ROW_STEP))),
    ).rgb;
  // A face keeps its shadow colour where its face map has it lit, so it is never black: the shadow colour is mixed toward
  // White by the face map's lit fraction. A body's shade is its ramp's colour, read down the row its region takes
  const shade =
    kind === CharacterMaterialKind.Face
      ? mix(
          createShadowMultiplyNode(region, inputs),
          vec3(1),
          createFaceShadeNode(inputs.faceMap, inputs.faceSoftness, inputs.faceDraw),
        )
      : inputs.isCoolShadow
        ? mix(sampleRamp(RAMP_ROW_BASE), sampleRamp(COOL_RAMP_ROW_BASE), inputs.coolShadowTone)
        : sampleRamp(RAMP_ROW_BASE);
  // The lit colour and the specular carry the hour's light colour, as the game's carry its main light's, and the emission
  // Does not
  const lit = materialColour.mul(shade).mul(brightness).mul(lightColor);
  const emitted = materialColour.mul(toVec3(emissionColor)).mul(emissionScaler);
  // The emission's factor is the main texture's alpha, past its floor, where the material draws its emission from it
  const emissionMask = inputs.isEmissionFromAlpha
    ? select(mainSample.a.greaterThan(EMISSION_ALPHA_FLOOR), mainSample.a, float(0))
    : float(0);
  const shaded = mix(lit, emitted, emissionMask);

  const halfVector = sunDirectionView.add(positionViewDirection).normalize();
  const highlight = max(normalView.dot(halfVector), float(1e-5)).pow(inputs.shininess);
  const specular = step(float(1).sub(lightMap.b), highlight)
    .mul(lightMap.r)
    .mul(toVec3(inputs.specularColor))
    .mul(inputs.specularMultiplier)
    .mul(lightColor);
  const lightColour = shaded.add(specular.mul(inputs.specularInShadow).mul(brightness));

  const coloured =
    metalTexture && kind === CharacterMaterialKind.Body
      ? select(
          lightMap.r.greaterThan(0.9),
          mix(
            toVec3(inputs.metalDarkColor),
            toVec3(inputs.metalLightColor),
            texture(metalTexture, normalView.xy.mul(0.5).add(0.5)).r,
          ),
          lightColour,
        )
      : lightColour;
  return createToneNode(coloured, inputs.desaturateScale, inputs.contrastScale);
};
