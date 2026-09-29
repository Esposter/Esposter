import { PARITY_DIRECTORY } from "#src/services/genshinParity/constants";
import { resolveSource } from "#src/services/genshinParity/resolveSource";
import ImageTracer from "imagetracerjs";
import { writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const INK = { a: 255, b: 0, g: 0, r: 0 };
const PAPER = { a: 255, b: 255, g: 255, r: 255 };
// A glyph in a region of an image as one filled path, so a mark is derived from the game's own shape rather than
// Guessed: the region is split into ink and paper halfway between its darkest and lightest pixel (a pale mark on a
// Pale ground splits as well as a dark one), traced into curves, and the ink's paths kept. The SVG is written beside
// The references, with the region and the trace side by side to check it against
export const traceImage = async (
  source: string,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
): Promise<void> => {
  const path = await resolveSource(source);
  const region = sharp(path).flatten({ background: "#fff" }).extract({ height, left: x, top: y, width });
  // Traced at the source's full resolution, never reduced; a small mark is smoothly enlarged first, so its antialiased
  // Edge becomes a curve rather than a staircase of its pixels
  const tracedWidth = Math.round(width * scale);
  const tracedHeight = Math.round(height * scale);
  const enlarged = await region.clone().resize(tracedWidth, tracedHeight, { kernel: "lanczos3" }).png().toBuffer();
  const { data } = await sharp(enlarged).greyscale().raw().toBuffer({ resolveWithObject: true });
  let darkest = 255;
  let lightest = 0;
  for (const value of data) {
    darkest = Math.min(darkest, value);
    lightest = Math.max(lightest, value);
  }
  const threshold = (darkest + lightest) / 2;
  const pixels = new Uint8ClampedArray(tracedWidth * tracedHeight * 4);
  for (const [index, value] of data.entries()) {
    const { a, b, g, r } = value < threshold ? INK : PAPER;
    pixels.set([r, g, b, a], index * 4);
  }
  const traced = ImageTracer.imagedataToSVG(
    { data: pixels, height: tracedHeight, width: tracedWidth },
    {
      colorsampling: 0,
      linefilter: false,
      ltres: 0.5,
      numberofcolors: 2,
      pal: [INK, PAPER],
      pathomit: 8,
      qtres: 0.5,
      roundcoords: 2,
    },
  );
  const inkPaths = [...traced.matchAll(/<path[^>]*fill="rgb\(0,0,0\)"[^>]*\sd="(?<d>[^"]+)"/gu)].map(
    ({ groups }) => groups?.d ?? "",
  );
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${tracedWidth} ${tracedHeight}"><path fill-rule="evenodd" d="${inkPaths.join(" ")}"/></svg>`;
  const name = `${basename(path, extname(path))}-trace-${x}-${y}`;
  const svgPath = join(PARITY_DIRECTORY, `${name}.svg`);
  await writeFile(svgPath, svg);
  const panels = await Promise.all([
    region.clone().resize(tracedWidth, tracedHeight).png().toBuffer(),
    sharp(Buffer.from(svg)).flatten({ background: "#fff" }).resize(tracedWidth, tracedHeight).png().toBuffer(),
  ]);
  const checkPath = join(PARITY_DIRECTORY, `${name}.png`);
  await sharp({ create: { background: "#fff", channels: 3, height: tracedHeight, width: tracedWidth * 2 } })
    .composite(panels.map((input, index) => ({ input, left: index * tracedWidth, top: 0 })))
    .png()
    .toFile(checkPath);
  console.log(`${inkPaths.length} paths, ${svg.length} bytes: ${svgPath}`);
  console.log(`region | trace: ${checkPath}`);
};
