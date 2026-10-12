import type { ToonThresholdNodeInputs } from "#src/models/character/ToonThresholdNodeInputs";
import type { Node } from "three/webgpu";

import { NEUTRAL_LIGHT_MAP_GREEN, TOON_HIGH, TOON_LOW } from "#src/character/shading/constants";
import { abs, float, select } from "three/tsl";

// The TSL form of getToonThreshold: the lightmap's green remapped about the neutral middle, scaled by the vertex's
// Occlusion where its flag is set, clamped at both ends and mixed with the sun term between them
export const createToonThresholdNode = ({
  isLightMapAo,
  isVertexAo,
  lightMapGreen,
  sunTerm,
  vertexAo,
}: ToonThresholdNodeInputs): Node<"float"> => {
  const light = isLightMapAo ? lightMapGreen : float(NEUTRAL_LIGHT_MAP_GREEN);
  const offset = light.sub(NEUTRAL_LIGHT_MAP_GREEN);
  const remapped = float(2).mul(offset).mul(abs(offset)).add(NEUTRAL_LIGHT_MAP_GREEN);
  const occluded = isVertexAo ? remapped.mul(vertexAo) : remapped;
  const mixed = occluded.add(sunTerm).div(2);
  return select(occluded.lessThan(TOON_LOW), float(0), select(occluded.greaterThan(TOON_HIGH), float(1), mixed));
};
