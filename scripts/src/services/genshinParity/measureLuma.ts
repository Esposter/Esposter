import { basename } from "node:path";
import sharp from "sharp";

// How dark one region is across a run of images, one line each: its mean darkness (0 is white) and its darkest
// Pixel, so a fade or a fill is read as a curve over the frames of the game and the shots of ours alike
export const measureLuma = async (
  x: number,
  y: number,
  width: number,
  height: number,
  paths: string[],
): Promise<void> => {
  const lines = await Promise.all(
    paths.map(async (path) => {
      const { data } = await sharp(path)
        .extract({ height, left: x, top: y, width })
        .greyscale()
        .raw()
        .toBuffer({ resolveWithObject: true });
      let sum = 0;
      let darkest = 255;
      for (const value of data) {
        sum += value;
        darkest = Math.min(darkest, value);
      }
      return `${basename(path).padEnd(28)} ${(255 - sum / data.length).toFixed(1).padStart(6)} ${String(darkest).padStart(4)}`;
    }),
  );
  console.log(`${"image".padEnd(28)} ${"dark".padStart(6)} ${"min".padStart(4)}`);
  for (const line of lines) console.log(line);
};
