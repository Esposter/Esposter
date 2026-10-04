import { CONTACT_SHEET_NAME } from "#src/services/genshinParity/shared/constants";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// How dark one region is across a run of images, one line each: its mean darkness (0 is white) and its darkest
// Pixel, so a fade or a fill is read as a curve over the frames of the game and the shots of ours alike. A folder
// Stands for its frames in order, since a second of frames at 60 a second outruns Windows' command line, each labelled
// With the path it was read from so two folders' frames stay apart
export const measureLuma = async (
  x: number,
  y: number,
  width: number,
  height: number,
  paths: string[],
): Promise<void> => {
  const imagePaths = (
    await Promise.all(
      paths.map(async (path) => {
        if (!(await stat(path)).isDirectory()) return [path];
        const names = await readdir(path);
        return names
          .filter((name) => name.endsWith(".png") && name !== CONTACT_SHEET_NAME)
          .toSorted()
          .map((name) => join(path, name));
      }),
    )
  ).flat();
  const lines = await Promise.all(
    imagePaths.map(async (path) => {
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
      return `${path.padEnd(28)} ${(255 - sum / data.length).toFixed(1).padStart(6)} ${String(darkest).padStart(4)}`;
    }),
  );
  console.log(`${"image".padEnd(28)} ${"dark".padStart(6)} ${"min".padStart(4)}`);
  for (const line of lines) console.log(line);
};
