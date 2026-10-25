import type { TerrainResidualGrid } from "#src/models/genshinAssets/fit/TerrainResidualGrid";
import type { TerrainResidual } from "genshin-engine";

import { RESIDUAL_OCTAVES, RESIDUAL_SEED } from "#src/services/genshinAssets/fit/constants";
import { getCorrelationLength } from "#src/services/genshinAssets/fit/getCorrelationLength";
import { getStandardDeviation } from "#src/services/genshinAssets/fit/getStandardDeviation";
import { mapTerrainResidualGrid } from "#src/services/genshinAssets/fit/mapTerrainResidualGrid";
import { roundFitted } from "#src/services/genshinAssets/fit/roundFitted";
import { sampleUnitNoise } from "#src/services/genshinAssets/fit/sampleUnitNoise";

// The noise's scales tried, in metres, the residual's correlation length picking the nearest
const SCALE_CANDIDATES = [8, 16, 32, 64, 128, 256];

// The fine ground a residual leaves as simplex noise, each sample weighed by how much of the noise is drawn there: the
// Scale whose weighted noise's correlation length is nearest the weighted residual's, and the amplitude that makes the
// Weighted noise's standard deviation over the same samples the weighted residual's, so the noise matches the ground it
// Is drawn on. Both are judged by the residual's statistics about its mean, never by its heights point for point. Where
// Every sample weighs none, as where the ground above holds within its gate everywhere, nothing of the residual is drawn,
// So the weighted noise has no deviation to scale and the amplitude is none
export const fitTerrainResidual = (
  grid: TerrainResidualGrid,
  getWeight: (x: number, z: number) => number,
): TerrainResidual => {
  const residual = mapTerrainResidualGrid(grid, (x, z, value) => getWeight(x, z) * value);
  const correlationLength = getCorrelationLength(residual);
  const candidates = SCALE_CANDIDATES.map((scale) => {
    const noise = sampleUnitNoise(residual, scale, getWeight);
    return { mismatch: Math.abs(getCorrelationLength(noise) - correlationLength), noise, scale };
  });
  const { noise, scale } = candidates.reduce((nearest, candidate) =>
    candidate.mismatch < nearest.mismatch ? candidate : nearest,
  );
  const noiseDeviation = getStandardDeviation(noise.values);
  return {
    amplitude: noiseDeviation > 0 ? roundFitted(getStandardDeviation(residual.values) / noiseDeviation) : 0,
    octaves: RESIDUAL_OCTAVES,
    scale,
    seed: RESIDUAL_SEED,
  };
};
