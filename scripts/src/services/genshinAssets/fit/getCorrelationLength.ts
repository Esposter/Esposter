import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";

import { getMean } from "#src/services/genshinAssets/fit/getMean";
import { getStandardDeviation } from "#src/services/genshinAssets/fit/getStandardDeviation";

// The farthest lag the correlation length is searched out to, in metres
const MAX_CORRELATION_LENGTH = 400;

// The distance at which a grid's values stop being correlated, the first lag their autocorrelation about their mean falls
// To 1/e
export const getCorrelationLength = ({ size, step, values }: TerrainResidualGrid): number => {
  const maxLag = Math.floor(MAX_CORRELATION_LENGTH / step);
  const variance = getStandardDeviation(values) ** 2;
  const mean = getMean(values);
  for (let lag = 1; lag <= maxLag; lag++) {
    let covariance = 0;
    let pairs = 0;
    for (let row = 0; row < size; row++)
      for (let column = 0; column + lag < size; column++) {
        const value = values[row * size + column] ?? Number.NaN;
        const neighbour = values[row * size + column + lag] ?? Number.NaN;
        if (!Number.isFinite(value) || !Number.isFinite(neighbour)) continue;
        covariance += (value - mean) * (neighbour - mean);
        pairs++;
      }
    if (pairs > 0 && covariance / pairs < variance / Math.E) return lag * step;
  }
  return MAX_CORRELATION_LENGTH;
};
