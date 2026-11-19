import { computeMetresPerPixel } from "#src/services/genshinParity/passes/computeMetresPerPixel";

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
}): number => {
  const sortedDepths = depths.toSorted((firstDepth, secondDepth) => firstDepth - secondDepth);
  const medianDepth = sortedDepths[Math.floor(sortedDepths.length / 2)] ?? 0;
  return computeMetresPerPixel({ depth: medianDepth, fovDegrees, height });
};
