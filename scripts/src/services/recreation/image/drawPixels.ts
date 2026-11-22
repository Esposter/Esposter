import { COLOUR_CHANNELS } from "#src/services/recreation/image/constants";
import sharp from "sharp";

// An image of the size given as a PNG, each pixel the colour the reader gives it
export const drawPixels = (
  { height, width }: { height: number; width: number },
  readPixel: (pixel: number) => readonly [number, number, number],
) => {
  const pixels = Buffer.alloc(width * height * COLOUR_CHANNELS);
  for (let pixel = 0; pixel < width * height; pixel++) pixels.set(readPixel(pixel), pixel * COLOUR_CHANNELS);
  return sharp(pixels, { raw: { channels: COLOUR_CHANNELS, height, width } })
    .png()
    .toBuffer();
};
