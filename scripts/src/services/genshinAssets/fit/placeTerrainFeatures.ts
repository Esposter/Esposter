import type { TerrainFeatureShape } from "#src/models/genshinAssets/fit/TerrainFeatureShape";
import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { TerrainFeature } from "genshin-engine";

import { TerrainFeatureKindBlendMap } from "genshin-engine";

// The most features of one kind a fit places
const MAX_FEATURES = 16;
// A feature is placed only while it takes off this share of the residual's squared error
const MIN_GAIN_SHARE = 0.01;

// Places features greedily on a residual grid: each round, the shape and centre whose mean residual takes the most
// Squared error off is a feature at that mean, and its exact height is then taken from the residual before the next
// Round. A shape is a candidate at a centre only where every sample it covers is fitted ground. Returns the features
// And the residual they leave
export const placeTerrainFeatures = <TFeature extends TerrainFeature>(
  grid: TerrainResidualGrid,
  shapes: readonly TerrainFeatureShape<TFeature>[],
): { features: TFeature[]; remainder: TerrainResidualGrid } => {
  const { originX, originZ, size, step } = grid;
  const values = Float64Array.from(grid.values);
  const features: TFeature[] = [];
  while (features.length < MAX_FEATURES) {
    const squaresTotal = values.reduce((sum, value) => (Number.isFinite(value) ? sum + value ** 2 : sum), 0);
    let bestGain = 0;
    let best: TFeature | undefined;
    for (const { createFeature, offsets, reach, spacing } of shapes)
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
          best = createFeature(originX + column * step, originZ + row * step, sum / offsets.length);
        }
    if (!best || bestGain < MIN_GAIN_SHARE * squaresTotal) break;
    features.push(best);
    const getBlend = TerrainFeatureKindBlendMap[best.kind];
    for (const [index, value] of values.entries()) {
      if (!Number.isFinite(value)) continue;
      const column = index % size;
      const row = Math.floor(index / size);
      values[index] = value - best.height * getBlend(best as never, originX + column * step, originZ + row * step);
    }
  }
  return { features, remainder: { ...grid, values } };
};
