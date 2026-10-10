import type { TerrainShape } from "#src/models/terrain/TerrainShape";

import { createGaussianHillsHeight } from "#src/terrain/createGaussianHillsHeight";
import { createResidualHeight } from "#src/terrain/createResidualHeight";
import { createTerrainFeaturesBlend } from "#src/terrain/createTerrainFeaturesBlend";
import { createTerrainFeaturesHeight } from "#src/terrain/createTerrainFeaturesHeight";

// The height of a ground composed in layers at any x and z: its hills over the base, the features they smear, and the
// Residual below both, drawn only past the features' reach and faded in across their blends. A layer the shape leaves
// Out adds nothing
export const createTerrainShapeHeight = ({
  features = [],
  residual,
  ...hills
}: TerrainShape): ((x: number, z: number) => number) => {
  const getHillsHeight = createGaussianHillsHeight(hills);
  const getFeaturesHeight = createTerrainFeaturesHeight(features);
  if (!residual) return (x, z) => getHillsHeight(x, z) + getFeaturesHeight(x, z);
  const getFeaturesBlend = createTerrainFeaturesBlend(features);
  const getResidualHeight = createResidualHeight(residual);
  return (x, z) => {
    const residualShare = 1 - getFeaturesBlend(x, z);
    const residualHeight = residualShare === 0 ? 0 : residualShare * getResidualHeight(x, z);
    return getHillsHeight(x, z) + getFeaturesHeight(x, z) + residualHeight;
  };
};
