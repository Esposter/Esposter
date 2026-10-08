import type { TerrainShape } from "#src/models/terrain/TerrainShape";

import { createGaussianHillsHeight } from "#src/terrain/createGaussianHillsHeight";
import { createResidualHeight } from "#src/terrain/createResidualHeight";
import { createTerrainFeaturesHeight } from "#src/terrain/createTerrainFeaturesHeight";

// The height of a ground composed in layers at any x and z: its hills over the base, the features they smear, and the
// Residual below both. A layer the shape leaves out adds nothing
export const createTerrainShapeHeight = (shape: TerrainShape): ((x: number, z: number) => number) => {
  const getHillsHeight = createGaussianHillsHeight(shape);
  const getFeaturesHeight = createTerrainFeaturesHeight(shape.features ?? []);
  const getResidualHeight = shape.residual ? createResidualHeight(shape.residual) : () => 0;
  return (x, z) => getHillsHeight(x, z) + getFeaturesHeight(x, z) + getResidualHeight(x, z);
};
