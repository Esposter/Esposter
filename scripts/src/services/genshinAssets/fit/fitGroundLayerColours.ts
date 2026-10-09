import type { SurfaceSample } from "#src/models/genshinAssets/fit/SurfaceSample";
import type { Vector } from "#src/models/shared/Vector";
import type { GroundPaint } from "genshin-engine";

import { computeSurfaceTones } from "#src/services/genshinAssets/fit/computeSurfaceTones";
import { createGroundLayerWeights, GroundLayers } from "genshin-engine";

// Which layer a face is painted in: the one its own rule weighs most at the face's centre, read by the same
// `createGroundLayerWeights` the paint draws with, so a face takes the layer the game's slope and height bands lay on it
export type LayerClassifier = (centroid: Vector, slope: number) => string;
export const createGroundLayerClassifier = (groundPaint: GroundPaint): LayerClassifier => {
  const getWeights = createGroundLayerWeights(groundPaint);
  return ([x, y, z], slope) => {
    const weights = getWeights(y, slope, x, z);
    return GroundLayers.reduce((dominant, layer) => (weights[layer] > weights[dominant] ? layer : dominant));
  };
};
// Each layer's colour as the area-weighted mean of the samples classified into it, as hex; a sample no layer holds is
// Left out
export const computeGroundLayerColours = (samples: readonly SurfaceSample[]): Record<string, string> => {
  const layered = samples.filter((sample): sample is SurfaceSample & { layer: string } => sample.layer !== undefined);
  const layers = Object.groupBy(layered, ({ layer }) => layer);
  return Object.fromEntries(
    Object.entries(layers).flatMap(([layer, members]) =>
      members === undefined ? [] : [[layer, computeSurfaceTones(members, 1).color]],
    ),
  );
};
