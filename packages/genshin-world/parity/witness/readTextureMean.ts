import type { Texture } from "three";

import { Color } from "three";

// The texels a texture is reduced to before its mean is taken
const MEAN_SAMPLE_SIZE = 16;
// A colour texture's mean over its texels, as a linear colour, read through a small canvas
export const readTextureMean = ({ image }: Texture): Color => {
  const canvas = new OffscreenCanvas(MEAN_SAMPLE_SIZE, MEAN_SAMPLE_SIZE);
  const context = canvas.getContext("2d");
  if (!context) return new Color(1, 1, 1);
  context.drawImage(image as CanvasImageSource, 0, 0, MEAN_SAMPLE_SIZE, MEAN_SAMPLE_SIZE);
  const { data } = context.getImageData(0, 0, MEAN_SAMPLE_SIZE, MEAN_SAMPLE_SIZE);
  const sums = [0, 0, 0];
  for (let index = 0; index < data.length; index += 4)
    for (let channel = 0; channel < 3; channel++) sums[channel] = (sums[channel] ?? 0) + (data[index + channel] ?? 0);
  const count = data.length / 4;
  const [red = 0, green = 0, blue = 0] = sums.map((sum) => sum / count / 255);
  return new Color().setRGB(red, green, blue, "srgb");
};
