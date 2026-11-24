import { computeAngleAutocorrelation } from "#src/services/genshinParity/passes/computeAngleAutocorrelation";
import { SHAPE_NORMAL_RESOLUTION_DEGREES } from "#src/services/genshinParity/passes/constants";
import { findDominantLag } from "#src/services/genshinParity/passes/findDominantLag";
import { highPassAngles } from "#src/services/genshinParity/passes/highPassAngles";

// The dominant lag of a family's normal angles, in samples: the strongest lobe of their autocorrelation along the rows,
// After a high-pass that takes out variation longer than `highPassRadius` samples as shape, and within
// `maxLag` samples. None where the angles hold no variation the measure can resolve, or no lobe in the range read
export const computeSurfaceLag = ({
  angles,
  highPassRadius,
  maxLag,
  width,
}: {
  angles: Float64Array;
  highPassRadius: number;
  maxLag: number;
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
  return findDominantLag(computeAngleAutocorrelation(detail, width, maxLag));
};
