import { PARITY_DIRECTORY } from "#src/services/genshinParity/constants";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

// A region of an image enlarged with hard pixel edges, for reading a border, a radius or a glyph's stroke exactly; with
// Other images, the same region of each stacked under it in order, so one region is read across a motion's frames or
// Ours beside a reference; with a grid, lines every so many of the image's own pixels labelled with where they fall, so
// A point is read off in the image's pixels
export const zoomImage = async (
  paths: readonly string[],
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
  grid = 0,
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
  const lines: string[] = [];
  if (grid > 0) {
    for (let column = Math.ceil(x / grid) * grid; column < x + width; column += grid) {
      const left = (column - x) * scale;
      lines.push(
        `<line x1="${left}" y1="0" x2="${left}" y2="${zoomedHeight}" stroke="#0ff" stroke-opacity="0.5"/><text x="${left + 2}" y="12" font-size="12" fill="#0ff">${column}</text>`,
      );
    }
    for (let row = Math.ceil(y / grid) * grid; row < y + height; row += grid) {
      const top = (row - y) * scale;
      lines.push(
        `<line x1="0" y1="${top}" x2="${zoomedWidth}" y2="${top}" stroke="#0ff" stroke-opacity="0.5"/><text x="2" y="${top - 2}" font-size="12" fill="#0ff">${row}</text>`,
      );
    }
  }
  const gridOverlay = Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${zoomedWidth}" height="${zoomedHeight}">${lines.join("")}</svg>`,
  );
  await sharp({
    create: { background: "#000", channels: 3, height: zoomedHeight * regions.length, width: zoomedWidth },
  })
    .composite(
      regions.flatMap((input, index) => [
        { input, left: 0, top: index * zoomedHeight },
        { input: gridOverlay, left: 0, top: index * zoomedHeight },
      ]),
    )
    .png()
    .toFile(outputPath);
  console.log(outputPath);
};
