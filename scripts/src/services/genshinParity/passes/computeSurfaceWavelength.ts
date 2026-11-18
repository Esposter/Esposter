import { computeAngleAutocorrelation } from "#src/services/genshinParity/passes/computeAngleAutocorrelation";
import { SHAPE_NORMAL_RESOLUTION_DEGREES } from "#src/services/genshinParity/passes/constants";
import { findDominantLag } from "#src/services/genshinParity/passes/findDominantLag";
import { highPassAngles } from "#src/services/genshinParity/passes/highPassAngles";

// The dominant wavelength of a family's normal angles in a frame, in metres: the strongest lobe of their autocorrelation
// Along the rows, after a high-pass that takes out variation longer than `highPassRadius` pixels as shape, and within
// `maxLag` pixels, past which a variation is the object's own size and not its detail. The lag is converted at the
// Family's depth by the frame's vertical field of view. A family whose angles resolve no lobe reads none
export const computeSurfaceWavelength = ({
  angles,
  depth,
  fovDegrees,
  height,
  highPassRadius,
  maxLag,
  width,
}: {
  angles: Float64Array;
  depth: number;
  fovDegrees: number;
  height: number;
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
  const lag = findDominantLag(computeAngleAutocorrelation(detail, width, maxLag));
  if (lag === undefined) return undefined;
  return (lag * 2 * depth * Math.tan((fovDegrees * Math.PI) / 360)) / height;
};
