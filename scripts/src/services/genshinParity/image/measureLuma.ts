import { BYTE } from "#src/services/shared/constants";
import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import sharp from "sharp";

// The table's columns, each as wide as its heading and its values need: the path, the mean darkness, the darkest pixel
const PATH_WIDTH = 28;
const DARK_WIDTH = 6;
const MIN_WIDTH = 4;

// How dark one region is in each image of a run, one line per image: its mean darkness (0 is white) and its darkest
// Pixel, so a fade or a fill is read across the frames of the game and the shots of ours alike. A folder
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
          .filter((name) => name.endsWith(".png"))
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
      let darkest = BYTE;
      for (const value of data) {
        sum += value;
        darkest = Math.min(darkest, value);
      }
      return `${path.padEnd(PATH_WIDTH)} ${(BYTE - sum / data.length).toFixed(1).padStart(DARK_WIDTH)} ${String(darkest).padStart(MIN_WIDTH)}`;
    }),
  );
  console.log(`${"image".padEnd(PATH_WIDTH)} ${"dark".padStart(DARK_WIDTH)} ${"min".padStart(MIN_WIDTH)}`);
  for (const line of lines) console.log(line);
};
