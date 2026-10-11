import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { PlateauFeature } from "genshin-engine";

import { computeFeatureOffsets } from "#src/services/genshinAssets/fit/computeFeatureOffsets";
import { placeTerrainFeatures } from "#src/services/genshinAssets/fit/placeTerrainFeatures";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { TerrainFeatureKind } from "genshin-engine";

// The radii a plateau is tried at, widest first: the sharp features the hills leave, in metres
const PLATEAU_RADII = [96, 48, 24];
// A plateau's edge falls across this share of its radius
const FALLOFF_SHARE = 0.25;
// Candidate centres stand this share of a radius apart
const CENTRE_SPACING_SHARE = 0.5;

// Places plateaus greedily on a residual grid: each round, the disc whose top and falling edge, fitted by least squares
// To the samples it draws on, take the most squared error off is a plateau at that height (`placeTerrainFeatures`).
// Returns the plateaus and the residual they leave
export const fitTerrainPlateaus = (
  grid: TerrainResidualGrid,
): { features: PlateauFeature[]; remainder: TerrainResidualGrid } =>
  placeTerrainFeatures(
    grid,
    PLATEAU_RADII.map((radius) => {
      const createFeature = (x: number, z: number, height: number): PlateauFeature => ({
        falloff: roundFitted(radius * FALLOFF_SHARE),
        height: roundFitted(height),
        kind: TerrainFeatureKind.Plateau,
        radius,
        x: roundFitted(x),
        z: roundFitted(z),
      });
      const { offsets, reach } = computeFeatureOffsets(createFeature(0, 0, 1), grid.step);
      return {
        createFeature,
        offsets,
        reach,
        spacing: Math.max(1, Math.round((CENTRE_SPACING_SHARE * radius) / grid.step)),
      };
    }),
  );
