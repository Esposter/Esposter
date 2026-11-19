import { RGB_CHANNEL_COUNT } from "#src/services/genshinParity/probe/constants";
import { TRAIL_CHANNEL_SPREAD_THRESHOLD, TRAIL_LUMINANCE_THRESHOLD } from "#src/services/genshinParity/trail/constants";

// One frame of a strike's region as the trail reads it: the trail pixels it holds, the length of each run of them along a
// Row, and the RGB sum of them, which the trail's colour is their mean of
export interface TrailFrameStats {
  area: number;
  runs: number[];
  seconds: number;
  sum: [number, number, number];
}

const RED_WEIGHT = 0.299;
const GREEN_WEIGHT = 0.587;
const BLUE_WEIGHT = 0.114;

// A pixel is trail when it is pale and close to grey, which separates the swing's arc from the rock, the sky and the
// Electro bolts, which are saturated
const checkIsTrailPixel = (red: number, green: number, blue: number): boolean => {
  const luminance = RED_WEIGHT * red + GREEN_WEIGHT * green + BLUE_WEIGHT * blue;
  return (
    luminance >= TRAIL_LUMINANCE_THRESHOLD &&
    Math.max(red, green, blue) - Math.min(red, green, blue) <= TRAIL_CHANNEL_SPREAD_THRESHOLD
  );
};

// The trail pixels of a `width` by `height` frame's RGB bytes, the runs they make along each row, and their sum
export const computeTrailFrameStats = (
  pixels: Uint8Array,
  width: number,
  height: number,
  seconds: number,
): TrailFrameStats => {
  const runs: number[] = [];
  const sum: [number, number, number] = [0, 0, 0];
  let area = 0;
  for (let row = 0; row < height; row++) {
    let run = 0;
    for (let column = 0; column < width; column++) {
      const offset = (row * width + column) * RGB_CHANNEL_COUNT;
      const red = pixels[offset] ?? 0;
      const green = pixels[offset + 1] ?? 0;
      const blue = pixels[offset + 2] ?? 0;
      if (checkIsTrailPixel(red, green, blue)) {
        run++;
        area++;
        sum[0] += red;
        sum[1] += green;
        sum[2] += blue;
      } else if (run > 0) {
        runs.push(run);
        run = 0;
      }
    }
    if (run > 0) runs.push(run);
  }
  return { area, runs, seconds, sum };
};
