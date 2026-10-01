import { PARITY_DIRECTORY } from "#src/services/genshinParity/constants";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

// A region of an image enlarged with hard pixel edges, for reading a border, a radius or a glyph's stroke exactly; with
// Other images, the same region of each stacked under it in order, so one region is read across a motion's frames or
// Ours beside a reference
export const zoomImage = async (
  paths: readonly string[],
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
): Promise<void> => {
  const [firstPath = ""] = paths;
  const outputPath = join(PARITY_DIRECTORY, `${basename(firstPath, extname(firstPath))}-zoom-${x}-${y}.png`);
  const zoomedWidth = Math.round(width * scale);
  const zoomedHeight = Math.round(height * scale);
  const regions = await Promise.all(
    paths.map((path) =>
      sharp(path)
        .extract({ height, left: x, top: y, width })
        .resize(zoomedWidth, zoomedHeight, { kernel: "nearest" })
        .png()
        .toBuffer(),
    ),
  );
  await sharp({
    create: { background: "#000", channels: 3, height: zoomedHeight * regions.length, width: zoomedWidth },
  })
    .composite(regions.map((input, index) => ({ input, left: 0, top: index * zoomedHeight })))
    .png()
    .toFile(outputPath);
  console.log(outputPath);
};
