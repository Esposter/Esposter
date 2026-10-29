import { LUMINANCE_WEIGHTS, RGB_CHANNEL_COUNT } from "#src/services/genshinParity/probe/constants";

// Each pixel's luminance, from its RGB channels, in the same row-major order the pixels are given
export const getLuminanceGrid = (pixels: Uint8Array, width: number, height: number): Float64Array => {
  const [redWeight, greenWeight, blueWeight] = LUMINANCE_WEIGHTS;
  const luminance = new Float64Array(width * height);
  for (let index = 0; index < width * height; index++) {
    const offset = index * RGB_CHANNEL_COUNT;
    luminance[index] =
      redWeight * (pixels[offset] ?? 0) +
      greenWeight * (pixels[offset + 1] ?? 0) +
      blueWeight * (pixels[offset + 2] ?? 0);
  }
  return luminance;
};
