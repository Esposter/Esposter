import { InvalidOperationError, Operation } from "@esposter/shared";

// The height of points held as a flat run of x, y and z values: the highest y less the lowest, across every array given.
// A set with no points has no height to read, so it is refused rather than measured as none
export const measureVerticalExtent = (pointArrays: readonly Float32Array[]): number => {
  let lowest = Infinity;
  let highest = -Infinity;
  for (const points of pointArrays)
    for (let index = 1; index < points.length; index += 3) {
      const y = points[index] ?? 0;
      lowest = Math.min(lowest, y);
      highest = Math.max(highest, y);
    }
  if (lowest > highest)
    throw new InvalidOperationError(Operation.Read, measureVerticalExtent.name, "no points to measure");
  return highest - lowest;
};
