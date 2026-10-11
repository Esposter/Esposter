import sharp from "sharp";

// An image of the size given as a PNG, each pixel the colour the reader gives it
export const drawPixels = (
  { height, width }: { height: number; width: number },
  readPixel: (pixel: number) => readonly [number, number, number],
): Promise<Buffer> => {
  const pixels = Buffer.alloc(width * height * 3);
  for (let pixel = 0; pixel < width * height; pixel++) pixels.set(readPixel(pixel), pixel * 3);
  return sharp(pixels, { raw: { channels: 3, height, width } })
    .png()
    .toBuffer();
};
