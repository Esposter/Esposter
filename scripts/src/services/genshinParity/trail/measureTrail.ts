import type { TrailFrameStats } from "#src/services/genshinParity/trail/computeTrailFrameStats";

import { TRAIL_FADED_SHARE, TRAIL_PRESENT_SHARE } from "#src/services/genshinParity/trail/constants";
import { computeMedian } from "#src/services/recreation/statistics/computeMedian";

// A strike's trail as the frames of its region read it: its width in pixels, its mean colour, the first and last frame
// It Draws, the seconds those frames are shown at, and the seconds from its peak to its fade, absent when it never
// Fades
export interface TrailMeasure {
  colour: [number, number, number];
  fadeSeconds?: number | undefined;
  frames: [number, number];
  seconds: [number, number];
  width: number;
}

// The strike is the run of frames around the frame holding the most trail, while each still holds a share of that peak.
// Its width is the median run of its trail along a row, its colour the mean of its trail, and it fades at the first
// Frame After the peak that holds under half of the peak's trail
export const measureTrail = (frames: readonly TrailFrameStats[]): TrailMeasure | undefined => {
  let peak = -1;
  let peakArea = 0;
  for (const [index, { area }] of frames.entries())
    if (area > peakArea) {
      peak = index;
      peakArea = area;
    }
  if (peak === -1) return undefined;
  const presentArea = peakArea * TRAIL_PRESENT_SHARE;
  let first = peak;
  while (first > 0 && (frames[first - 1]?.area ?? 0) >= presentArea) first--;
  let last = peak;
  while (last < frames.length - 1 && (frames[last + 1]?.area ?? 0) >= presentArea) last++;
  const strike = frames.slice(first, last + 1);
  const area = strike.reduce((total, frame) => total + frame.area, 0);
  const sum = strike.reduce(
    (total, frame) => total.map((channel, index) => channel + (frame.sum[index] ?? 0)),
    [0, 0, 0],
  );
  const fadeIndex = frames.findIndex((frame, index) => index > peak && frame.area < peakArea * TRAIL_FADED_SHARE);
  return {
    colour: [Math.round((sum[0] ?? 0) / area), Math.round((sum[1] ?? 0) / area), Math.round((sum[2] ?? 0) / area)],
    fadeSeconds: fadeIndex === -1 ? undefined : (frames[fadeIndex]?.seconds ?? 0) - (frames[peak]?.seconds ?? 0),
    frames: [first, last],
    seconds: [frames[first]?.seconds ?? 0, frames[last]?.seconds ?? 0],
    width: computeMedian(strike.flatMap((frame) => frame.runs)),
  };
};
