import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { CliffFeature } from "genshin-engine";

import { createSegmentShapes } from "#src/services/genshinAssets/fit/createSegmentShapes";
import { placeTerrainFeatures } from "#src/services/genshinAssets/fit/placeTerrainFeatures";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { TerrainFeatureKind } from "genshin-engine";

// A cliff's band reaches this share of its length across its line
const WIDTH_SHARE = 0.5;
// A cliff's edges fall across this share of its band's width
const FALLOFF_SHARE = 0.25;

// Places cliffs greedily on a residual grid: each round, the segment whose terrace, raised on its left out to half its
// Length and fitted by least squares to the samples it draws on, takes the most squared error off is a cliff at that
// Height (`placeTerrainFeatures`). Its headings go round the full turn, so the side it raises covers both sides of every
// Line. Returns the cliffs and the residual they leave
export const fitTerrainCliffs = (
  grid: TerrainResidualGrid,
): { features: CliffFeature[]; remainder: TerrainResidualGrid } =>
  placeTerrainFeatures(
    grid,
    createSegmentShapes(grid.step, 2 * Math.PI, ({ endX, endZ, startX, startZ }, length, height) => ({
      endX,
      endZ,
      falloff: roundFitted(length * WIDTH_SHARE * FALLOFF_SHARE),
      height: roundFitted(height),
      kind: TerrainFeatureKind.Cliff,
      startX,
      startZ,
      width: length * WIDTH_SHARE,
    })),
  );
