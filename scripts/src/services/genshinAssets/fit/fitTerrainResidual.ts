import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { TerrainResidual } from "genshin-engine";

import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { createResidualHeight } from "genshin-engine";

// The octaves and seed the residual is drawn with, fixed so one residual always fits to the same noise
const RESIDUAL_OCTAVES = 3;
const RESIDUAL_SEED = 1;
// The noise's scales tried, in metres, the residual's correlation length picking the nearest
const SCALE_CANDIDATES = [8, 16, 32, 64, 128, 256];
// The farthest lag the correlation length is searched out to, in metres
const MAX_CORRELATION_LENGTH = 400;

// The mean of a grid's finite values, which its statistics are taken about, so an offset the residual keeps is not read as
// Its roughness
const getMean = (values: Float64Array): number => {
  let sum = 0;
  let count = 0;
  for (const value of values)
    if (Number.isFinite(value)) {
      sum += value;
      count++;
    }
  return sum / count;
};

const getStandardDeviation = (values: Float64Array): number => {
  const mean = getMean(values);
  let sum = 0;
  let count = 0;
  for (const value of values)
    if (Number.isFinite(value)) {
      sum += (value - mean) ** 2;
      count++;
    }
  return Math.sqrt(sum / count);
};

// The distance at which a grid's values stop being correlated, the first lag their autocorrelation about their mean falls
// To 1/e
const getCorrelationLength = ({ size, step, values }: TerrainResidualGrid): number => {
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

// The noise a scale draws over the same grid, with the amplitude of one metre
const sampleUnitNoise = (grid: TerrainResidualGrid, scale: number): TerrainResidualGrid => {
  const getNoise = createResidualHeight({ amplitude: 1, octaves: RESIDUAL_OCTAVES, scale, seed: RESIDUAL_SEED });
  const values = new Float64Array(grid.size * grid.size);
  for (let row = 0; row < grid.size; row++)
    for (let column = 0; column < grid.size; column++)
      values[row * grid.size + column] = getNoise(grid.originX + column * grid.step, grid.originZ + row * grid.step);
  return { ...grid, values };
};

// The fine ground a residual leaves as simplex noise: the scale whose noise's correlation length is nearest the
// Residual's, and the amplitude that makes the noise's standard deviation over the same grid the residual's. Both are
// Judged by the residual's statistics, never by its heights point for point
export const fitTerrainResidual = (grid: TerrainResidualGrid): TerrainResidual => {
  const correlationLength = getCorrelationLength(grid);
  const candidates = SCALE_CANDIDATES.map((scale) => {
    const noise = sampleUnitNoise(grid, scale);
    return { mismatch: Math.abs(getCorrelationLength(noise) - correlationLength), noise, scale };
  });
  const { noise, scale } = candidates.reduce((nearest, candidate) =>
    candidate.mismatch < nearest.mismatch ? candidate : nearest,
  );
  return {
    amplitude: roundFitted(getStandardDeviation(grid.values) / getStandardDeviation(noise.values)),
    octaves: RESIDUAL_OCTAVES,
    scale,
    seed: RESIDUAL_SEED,
  };
};
