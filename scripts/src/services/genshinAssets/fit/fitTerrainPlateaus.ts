import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { PlateauFeature } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { getPlateauBlend, TerrainFeatureKind } from "genshin-engine";

// The radii a plateau is tried at, widest first: the sharp features the hills leave, in metres
const PLATEAU_RADII = [96, 48, 24];
// A plateau's edge falls across this share of its radius
const FALLOFF_SHARE = 0.25;
// Candidate centres stand this share of a radius apart
const CENTRE_SPACING_SHARE = 0.5;
// The most plateaus one fit places
const MAX_PLATEAUS = 16;
// A plateau is placed only while it takes off this share of the residual's squared error
const MIN_GAIN_SHARE = 0.01;

// Places plateaus greedily on a residual grid: each round, the disc whose mean residual takes the most squared error off
// Is a plateau at that mean, and its exact height is then taken from the residual before the next round. A disc is a
// Candidate only where every sample inside it is fitted ground. Returns the plateaus and the residual they leave
export const fitTerrainPlateaus = (
  grid: TerrainResidualGrid,
): { features: PlateauFeature[]; remainder: TerrainResidualGrid } => {
  const { originX, originZ, size, step } = grid;
  const values = Float64Array.from(grid.values);
  const features: PlateauFeature[] = [];
  const discs = PLATEAU_RADII.map((radius) => {
    const radiusCells = radius / step;
    const reach = Math.ceil(radiusCells);
    const offsets: [number, number][] = [];
    for (let rowShift = -reach; rowShift <= reach; rowShift++)
      for (let columnShift = -reach; columnShift <= reach; columnShift++)
        if (rowShift ** 2 + columnShift ** 2 <= radiusCells ** 2) offsets.push([rowShift, columnShift]);
    return { offsets, radius, reach, spacing: Math.max(1, Math.round(CENTRE_SPACING_SHARE * radiusCells)) };
  });
  while (features.length < MAX_PLATEAUS) {
    const squaresTotal = values.reduce((sum, value) => (Number.isFinite(value) ? sum + value ** 2 : sum), 0);
    let bestGain = 0;
    let best: PlateauFeature | undefined;
    for (const { offsets, radius, reach, spacing } of discs)
      for (let row = reach; row < size - reach; row += spacing)
        for (let column = reach; column < size - reach; column += spacing) {
          let sum = 0;
          let isCovered = true;
          for (const [rowShift, columnShift] of offsets) {
            const value = values[(row + rowShift) * size + column + columnShift] ?? Number.NaN;
            if (!Number.isFinite(value)) {
              isCovered = false;
              break;
            }
            sum += value;
          }
          if (!isCovered) continue;
          const gain = sum ** 2 / offsets.length;
          if (gain <= bestGain) continue;
          bestGain = gain;
          best = {
            falloff: roundFitted(radius * FALLOFF_SHARE),
            height: roundFitted(sum / offsets.length),
            kind: TerrainFeatureKind.Plateau,
            radius,
            x: roundFitted(originX + column * step),
            z: roundFitted(originZ + row * step),
          };
        }
    if (!best || bestGain < MIN_GAIN_SHARE * squaresTotal) break;
    features.push(best);
    for (const [index, value] of values.entries()) {
      if (!Number.isFinite(value)) continue;
      const column = index % size;
      const row = Math.floor(index / size);
      values[index] = value - best.height * getPlateauBlend(best, originX + column * step, originZ + row * step);
    }
  }
  return { features, remainder: { ...grid, values } };
};
