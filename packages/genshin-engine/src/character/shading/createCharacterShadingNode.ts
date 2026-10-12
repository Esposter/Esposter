import type { CharacterShadingInputs } from "#src/models/character/CharacterShadingInputs";
import type { LightUniforms } from "#src/models/nodes/LightUniforms";
import type { Vector3Tuple } from "three";
import type { Node } from "three/webgpu";

import {
  COOL_RAMP_ROW_BASE,
  FLAT_LIGHT_MAP,
  MINIMUM_RAMP_WIDTH_VERTEX,
  RAMP_ROW_BASE,
  RAMP_ROW_STEP,
} from "#src/character/shading/constants";
import { createFaceShadeNode } from "#src/character/shading/createFaceShadeNode";
import { createRampColumnNode } from "#src/character/shading/createRampColumnNode";
import { createShadingRegionNode } from "#src/character/shading/createShadingRegionNode";
import { createToneNode } from "#src/character/shading/createToneNode";
import { createToonThresholdNode } from "#src/character/shading/createToonThresholdNode";
import { CharacterMaterialKind } from "#src/models/character/CharacterMaterialKind";
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

// The character's colour as the game's shader draws it, the TSL form of the shading page: the region's tint on the main
// Texture, lit on the shadow ramp row of its region, its emission lerped in by the lightmap's green, its specular step,
// The metal matcap where the lightmap's red passes the gate, and the output tone. A face is shaded by its face map in
// Place of the ramp, and a hair takes the body's path without the metal branch
export const createCharacterShadingNode = (
  inputs: CharacterShadingInputs,
  { sunDirection }: Pick<LightUniforms, "sunDirection">,
): Node<"vec3"> => {
  const { brightness, color, emissionColor, emissionScaler, kind, metalTexture, regionTints, regionToggles } = inputs;
  const sunDirectionView = cameraViewMatrix.mul(vec4(sunDirection, 0)).xyz.normalize();
  const [flatRed, flatGreen, flatBlue, flatAlpha] = FLAT_LIGHT_MAP;
  const lightMap = inputs.lightMapTexture
    ? texture(inputs.lightMapTexture, uv())
    : vec4(flatRed, flatGreen, flatBlue, flatAlpha);
  const region = createShadingRegionNode(lightMap.a, regionToggles);
  const regionTintEntries: [number, Vector3Tuple][] = [
    [2, regionTints.two],
    [3, regionTints.three],
    [4, regionTints.four],
    [5, regionTints.five],
  ];
  const tint = regionTintEntries.reduce<Node<"vec3">>(
    (current, [regionNumber, regionColor]) => select(region.equal(float(regionNumber)), toVec3(regionColor), current),
    toVec3(color),
  );
  const mainColour = inputs.mainTexture ? texture(inputs.mainTexture, uv()).rgb : vec3(1);
  const materialColour = mainColour.mul(tint);

  const sunTerm = normalView.dot(sunDirectionView).saturate();
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
  // A region's row is its base plus a step per region past one, read from the ramp's bottom up
  const sampleRamp = (rowBase: number): Node<"float"> =>
    texture(inputs.rampTexture, vec2(column, float(1).sub(float(rowBase).add(region.sub(1).mul(RAMP_ROW_STEP))))).r;
  const shade =
    kind === CharacterMaterialKind.Face
      ? createFaceShadeNode(inputs.faceMap, inputs.faceSoftness)
      : inputs.isCoolShadow
        ? mix(sampleRamp(RAMP_ROW_BASE), sampleRamp(COOL_RAMP_ROW_BASE), inputs.coolShadowTone)
        : sampleRamp(RAMP_ROW_BASE);
  const lit = materialColour.mul(shade).mul(brightness);
  const emitted = materialColour.mul(toVec3(emissionColor)).mul(emissionScaler);
  const shaded = mix(lit, emitted, lightMap.g);

  const halfVector = sunDirectionView.add(positionViewDirection).normalize();
  const highlight = max(normalView.dot(halfVector), float(1e-5)).pow(inputs.shininess);
  const specular = step(float(1).sub(lightMap.b), highlight)
    .mul(lightMap.r)
    .mul(toVec3(inputs.specularColor))
    .mul(inputs.specularMultiplier);
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
