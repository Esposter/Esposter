import { computeMetresPerPixel } from "#src/services/genshinParity/passes/computeMetresPerPixel";
import { computeUpperMedian } from "#src/services/recreation/statistics/computeUpperMedian";

// The metres one pixel spans at the median of a family's depths, in a frame of the given field of view and height. The
// Median is taken over the sorted depths, so a few far pixels of the family do not stretch the scale
export const computeMedianMetresPerPixel = ({
  depths,
  fovDegrees,
  height,
}: {
  depths: number[];
  fovDegrees: number;
  height: number;
}): number => computeMetresPerPixel({ depth: computeUpperMedian(depths), fovDegrees, height });
