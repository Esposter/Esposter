import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { PlateauFeature } from "genshin-engine";

import { placeTerrainFeatures } from "#src/services/genshinAssets/fit/placeTerrainFeatures";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { TerrainFeatureKind } from "genshin-engine";

// The radii a plateau is tried at, widest first: the sharp features the hills leave, in metres
const PLATEAU_RADII = [96, 48, 24];
// A plateau's edge falls across this share of its radius
const FALLOFF_SHARE = 0.25;
// Candidate centres stand this share of a radius apart
const CENTRE_SPACING_SHARE = 0.5;

// Places plateaus greedily on a residual grid: each round, the disc whose mean residual takes the most squared error
// Off is a plateau at that mean (`placeTerrainFeatures`). Returns the plateaus and the residual they leave
export const fitTerrainPlateaus = (
  grid: TerrainResidualGrid,
): { features: PlateauFeature[]; remainder: TerrainResidualGrid } =>
  placeTerrainFeatures(
    grid,
    PLATEAU_RADII.map((radius) => {
      const radiusCells = radius / grid.step;
      const reach = Math.ceil(radiusCells);
      const offsets: [number, number, number][] = [];
      for (let rowShift = -reach; rowShift <= reach; rowShift++)
        for (let columnShift = -reach; columnShift <= reach; columnShift++)
          if (rowShift ** 2 + columnShift ** 2 <= radiusCells ** 2) offsets.push([rowShift, columnShift, 1]);
      return {
        createFeature: (x, z, height) => ({
          falloff: roundFitted(radius * FALLOFF_SHARE),
          height: roundFitted(height),
          kind: TerrainFeatureKind.Plateau,
          radius,
          x: roundFitted(x),
          z: roundFitted(z),
        }),
        offsets,
        reach,
        spacing: Math.max(1, Math.round(CENTRE_SPACING_SHARE * radiusCells)),
      };
    }),
  );
