import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { RidgeFeature } from "genshin-engine";

import { createSegmentShapes } from "#src/services/genshinAssets/fit/createSegmentShapes";
import { placeTerrainFeatures } from "#src/services/genshinAssets/fit/placeTerrainFeatures";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { TerrainFeatureKind } from "genshin-engine";

// A ridge's width is this share of its length
const WIDTH_SHARE = 0.25;

// Places ridges greedily on a residual grid: each round, the segment whose Gaussian profile, fitted by least squares to
// The samples it draws on out to its reach, takes the most squared error off is a ridge at that height
// (`placeTerrainFeatures`). A ridge is the same either way along its segment, so its headings go round the half turn.
// Returns the ridges and the residual they leave
export const fitTerrainRidges = (
  grid: TerrainResidualGrid,
): { features: RidgeFeature[]; remainder: TerrainResidualGrid } =>
  placeTerrainFeatures(
    grid,
    createSegmentShapes(grid.step, Math.PI, ({ endX, endZ, startX, startZ }, length, height) => ({
      endX,
      endZ,
      height: roundFitted(height),
      kind: TerrainFeatureKind.Ridge,
      startX,
      startZ,
      width: length * WIDTH_SHARE,
    })),
  );
