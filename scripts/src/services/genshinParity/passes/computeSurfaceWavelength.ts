import { computeAngleAutocorrelation } from "#src/services/genshinParity/passes/computeAngleAutocorrelation";
import { SHAPE_NORMAL_RESOLUTION_DEGREES } from "#src/services/genshinParity/passes/constants";
import { findDominantLag } from "#src/services/genshinParity/passes/findDominantLag";
import { highPassAngles } from "#src/services/genshinParity/passes/highPassAngles";

// The dominant wavelength of a family's normal angles, in metres: the strongest lobe of their autocorrelation along the
// Rows, after a high-pass that takes out variation longer than `highPassRadius` samples as shape, and within `maxLag`
// Samples, past which a variation is the object's own size and not its detail. A sample is a pixel of a frame, which
// `metresPerSample` converts at the family's depth, or a texel of its normal map. A family whose angles resolve no lobe
// Reads none
export const computeSurfaceWavelength = ({
  angles,
  highPassRadius,
  maxLag,
  metresPerSample,
  width,
}: {
  angles: Float64Array;
  highPassRadius: number;
  maxLag: number;
  metresPerSample: number;
  width: number;
}): number | undefined => {
  const detail = highPassAngles(angles, width, highPassRadius);
  let sum = 0;
  let sumSquares = 0;
  let count = 0;
  for (const value of detail)
    if (!Number.isNaN(value)) {
      sum += value;
      sumSquares += value * value;
      count++;
    }
  // Normals that vary less than the normal resolution hold no detail, and their autocorrelation is float noise
  if (count === 0 || Math.sqrt(sumSquares / count - (sum / count) ** 2) < SHAPE_NORMAL_RESOLUTION_DEGREES)
    return undefined;
  const lag = findDominantLag(computeAngleAutocorrelation(detail, width, maxLag));
  if (lag === undefined) return undefined;
  return lag * metresPerSample;
};
