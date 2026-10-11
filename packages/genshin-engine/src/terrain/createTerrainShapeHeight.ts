import type { TerrainShape } from "#src/models/terrain/TerrainShape";

import { createGaussianHillsHeight } from "#src/terrain/createGaussianHillsHeight";
import { createResidualHeight } from "#src/terrain/createResidualHeight";
import { createTerrainFeaturesBlend } from "#src/terrain/createTerrainFeaturesBlend";
import { createTerrainFeaturesHeight } from "#src/terrain/createTerrainFeaturesHeight";
import { getTerrainShapeLevel } from "#src/terrain/getTerrainShapeLevel";

// The height of a ground composed in layers at any x and z: its hills over the base, the features they smear, and the
// Residual below both, drawn only past the features' reach and faded in across their blends. A layer the shape leaves
// Out adds nothing. Grounds laid over it are composed into the same layers: their hills and features filed with its, so
// A point reads only those near it, each one lifted by its base over this one's (`getTerrainShapeLevel`), a level
// Filed with the features' heights but never their blend, and every residual kept off every feature
export const createTerrainShapeHeight = (
  shape: TerrainShape,
  ...overlays: TerrainShape[]
): ((x: number, z: number) => number) => {
  const shapes = [shape, ...overlays];
  const features = shapes.flatMap((layer) => layer.features ?? []);
  const levels = overlays.flatMap((overlay) => getTerrainShapeLevel(overlay, shape.base) ?? []);
  const getHillsHeight = createGaussianHillsHeight({ base: shape.base, hills: shapes.flatMap(({ hills }) => hills) });
  const getFeaturesHeight = createTerrainFeaturesHeight([...features, ...levels]);
  const residualHeights = shapes.flatMap(({ residual }) => (residual ? [createResidualHeight(residual)] : []));
  if (residualHeights.length === 0) return (x, z) => getHillsHeight(x, z) + getFeaturesHeight(x, z);
  const getFeaturesBlend = createTerrainFeaturesBlend(features);
  return (x, z) => {
    const residualShare = 1 - getFeaturesBlend(x, z);
    let residualHeight = 0;
    if (residualShare > 0)
      for (const getResidualHeight of residualHeights) residualHeight += residualShare * getResidualHeight(x, z);
    return getHillsHeight(x, z) + getFeaturesHeight(x, z) + residualHeight;
  };
};
