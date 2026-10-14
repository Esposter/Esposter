import { NEUTRAL_LIGHT_MAP_GREEN, TOON_HIGH, TOON_LOW } from "#src/character/shading/constants";

interface ToonThresholdInputs {
  // Whether the lightmap's green is the ambient occlusion, which the material's own flag selects
  isLightMapAo: boolean;
  isVertexAo: boolean;
  lightMapGreen: number;
  sunTerm: number;
  vertexAo: number;
}

// The toon threshold z, the lit side's share of a pixel: the lightmap's green remapped about the middle, scaled by the
// Vertex's ambient occlusion where its flag is set, then clamped to the ends and mixed with the sun term elsewhere
export const getToonThreshold = ({
  isLightMapAo,
  isVertexAo,
  lightMapGreen,
  sunTerm,
  vertexAo,
}: ToonThresholdInputs): number => {
  const light = isLightMapAo ? lightMapGreen : NEUTRAL_LIGHT_MAP_GREEN;
  const offset = light - NEUTRAL_LIGHT_MAP_GREEN;
  const remapped = 2 * offset * Math.abs(offset) + NEUTRAL_LIGHT_MAP_GREEN;
  const occluded = isVertexAo ? remapped * vertexAo : remapped;
  if (occluded < TOON_LOW) return 0;
  if (occluded > TOON_HIGH) return 1;
  return (occluded + sunTerm) / 2;
};
