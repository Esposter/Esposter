import { PARITY_DIRECTORY } from "#src/services/genshinParity/constants";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

// A region of an image enlarged with hard pixel edges, for reading a border, a radius or a glyph's stroke exactly
export const zoomImage = async (
  path: string,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
): Promise<void> => {
  const outputPath = join(PARITY_DIRECTORY, `${basename(path, extname(path))}-zoom-${x}-${y}.png`);
  await sharp(path)
    .extract({ height, left: x, top: y, width })
    .resize(width * scale, height * scale, { kernel: "nearest" })
    .png()
    .toFile(outputPath);
  console.log(outputPath);
};
