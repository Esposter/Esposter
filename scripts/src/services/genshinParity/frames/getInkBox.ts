import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { PROBE_EDGE_LEVEL, PROBE_MIN_EDGE_STEP } from "#src/services/genshinParity/probe/constants";

// The box a rectangle's ink fills, in its own pixels: the pixels whose ink reaches the probe's halfway level between
// The Least and the most inked of them. The spread between those must be a strong step, as an edge's is, so a flat or
// Noisy Rectangle has no box
export const getInkBox = (ink: Float64Array, width: number, height: number): ImageRegion | undefined => {
  let low = Infinity;
  let high = -Infinity;
  for (const value of ink) {
    low = Math.min(low, value);
    high = Math.max(high, value);
  }
  const range = high - low;
  if (range < PROBE_MIN_EDGE_STEP) return undefined;
  const level = low + range * PROBE_EDGE_LEVEL;
  let left = width;
  let top = height;
  let right = -1;
  let bottom = -1;
  for (let row = 0; row < height; row++)
    for (let column = 0; column < width; column++)
      if ((ink[row * width + column] ?? 0) >= level) {
        left = Math.min(left, column);
        top = Math.min(top, row);
        right = Math.max(right, column);
        bottom = Math.max(bottom, row);
      }
  return { height: bottom - top + 1, width: right - left + 1, x: left, y: top };
};
