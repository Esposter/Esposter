import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { CliffFeature } from "genshin-engine";

import { placeTerrainFeatures } from "#src/services/genshinAssets/fit/placeTerrainFeatures";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { TerrainFeatureKind } from "genshin-engine";

// The lengths a cliff's segment is tried at, longest first, in metres
const CLIFF_LENGTHS = [96, 48, 24];
// The headings a segment is tried at, evenly round the full turn, so the side its left normal raises covers both sides
// Of every line
const CLIFF_HEADINGS = 16;
// A cliff's band reaches this share of its length across its line
const WIDTH_SHARE = 0.5;
// A cliff's edges fall across this share of its band's width
const FALLOFF_SHARE = 0.25;
// Candidate centres stand this share of a length apart
const CENTRE_SPACING_SHARE = 0.5;

// Places cliffs greedily on a residual grid: each round, the segment whose band, the samples along it out to its width
// On its left, has the mean residual that takes the most squared error off is a cliff at that mean
// (`placeTerrainFeatures`), its heading tried rather than solved. Returns the cliffs and the residual they leave
export const fitTerrainCliffs = (
  grid: TerrainResidualGrid,
): { features: CliffFeature[]; remainder: TerrainResidualGrid } =>
  placeTerrainFeatures(
    grid,
    CLIFF_LENGTHS.flatMap((length) => {
      const halfLength = length / 2;
      const width = length * WIDTH_SHARE;
      const reach = Math.ceil(Math.hypot(halfLength, width) / grid.step);
      const spacing = Math.max(1, Math.round((CENTRE_SPACING_SHARE * length) / grid.step));
      return Array.from({ length: CLIFF_HEADINGS }, (_value, index) => {
        const heading = (2 * Math.PI * index) / CLIFF_HEADINGS;
        const directionX = Math.cos(heading);
        const directionZ = Math.sin(heading);
        const offsets: [number, number][] = [];
        for (let rowShift = -reach; rowShift <= reach; rowShift++)
          for (let columnShift = -reach; columnShift <= reach; columnShift++) {
            const offsetX = columnShift * grid.step;
            const offsetZ = rowShift * grid.step;
            const along = offsetX * directionX + offsetZ * directionZ;
            const across = directionX * offsetZ - directionZ * offsetX;
            if (Math.abs(along) <= halfLength && across >= 0 && across <= width) offsets.push([rowShift, columnShift]);
          }
        return {
          createFeature: (x, z, height) => ({
            endX: roundFitted(x + halfLength * directionX),
            endZ: roundFitted(z + halfLength * directionZ),
            falloff: roundFitted(width * FALLOFF_SHARE),
            height: roundFitted(height),
            kind: TerrainFeatureKind.Cliff,
            startX: roundFitted(x - halfLength * directionX),
            startZ: roundFitted(z - halfLength * directionZ),
            width,
          }),
          offsets,
          reach,
          spacing,
        };
      });
    }),
  );
