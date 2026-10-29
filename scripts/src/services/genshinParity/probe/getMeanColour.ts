import { RGB_CHANNEL_COUNT } from "#src/services/genshinParity/probe/constants";

// The mean of each of a rectangle's red, green and blue channels over its pixels, unrounded
export const getMeanColour = (pixels: Uint8Array, count: number): [number, number, number] => {
  let red = 0;
  let green = 0;
  let blue = 0;
  for (let index = 0; index < count; index++) {
    const offset = index * RGB_CHANNEL_COUNT;
    red += pixels[offset] ?? 0;
    green += pixels[offset + 1] ?? 0;
    blue += pixels[offset + 2] ?? 0;
  }
  const denominator = Math.max(count, 1);
  return [red / denominator, green / denominator, blue / denominator];
};
