import { PARITY_DIRECTORY } from "#src/services/genshinParity/shared/constants";
import { removeMaskSpecks } from "#src/services/genshinParity/shared/removeMaskSpecks";
import { resolveSource } from "#src/services/genshinParity/shared/resolveSource";
import ImageTracer from "imagetracerjs";
import { writeFile } from "node:fs/promises";
import { basename, extname, join } from "node:path";
import sharp from "sharp";

const INK = { a: 255, b: 0, g: 0, r: 0 };
const PAPER = { a: 255, b: 255, g: 255, r: 255 };
// The share of the region under which a run of ink, or of paper the ink encloses, is a speck the source carries
const SPECK_SHARE = 0.0002;
// A glyph in a region of an image as one filled path, so a mark is derived from the game's own shape rather than
// Guessed: the region is split into ink and paper halfway between its faintest and strongest ink (a pale mark on a
// Pale ground splits as well as a dark one), traced into curves, and the ink's paths kept. The SVG is written beside
// The references, with the region and the trace side by side to check it against, and its path returned
export const traceImage = async (
  source: string,
  x: number,
  y: number,
  width: number,
  height: number,
  scale: number,
  // Where between the faintest and strongest ink the split falls: halfway for a mark whose antialiased edge is its
  // Outline, lower for a mark the game draws flat over one printed with lighter detail (a logo's sparkles), so that
  // Detail stays ink rather than notching the edge it touches
  inkShare: number,
): Promise<string> => {
  const path = await resolveSource(source);
  const region = sharp(path).flatten({ background: "#fff" }).extract({ height, left: x, top: y, width });
  // Traced at the source's full resolution, never reduced; a small mark is smoothly enlarged first, so its antialiased
  // Edge becomes a curve rather than a staircase of its pixels
  const tracedWidth = Math.round(width * scale);
  const tracedHeight = Math.round(height * scale);
  const enlarged = await region.clone().resize(tracedWidth, tracedHeight, { kernel: "lanczos3" }).png().toBuffer();
  const { data, info } = await sharp(enlarged).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  // The paper is the colour at the region's corners, and each pixel's ink how far its furthest channel strays from it,
  // So a mark dark on white, lit on black or coloured on either splits from its ground alike, a bright stroke as
  // Surely as a dark one
  const pixelCount = tracedWidth * tracedHeight;
  const channelAt = (pixel: number, channel: number): number => data[pixel * info.channels + channel] ?? 0;
  const corners = [0, tracedWidth - 1, pixelCount - tracedWidth, pixelCount - 1];
  const paper = [0, 1, 2].map(
    (channel) => corners.reduce((sum, corner) => sum + channelAt(corner, channel), 0) / corners.length,
  );
  const inks = Float32Array.from({ length: pixelCount }, (_, pixel) =>
    Math.max(...paper.map((value, channel) => Math.abs(channelAt(pixel, channel) - value))),
  );
  let faintest = Infinity;
  let strongest = 0;
  for (const ink of inks) {
    faintest = Math.min(faintest, ink);
    strongest = Math.max(strongest, ink);
  }
  const threshold = faintest + (strongest - faintest) * inkShare;
  const speckArea = tracedWidth * tracedHeight * SPECK_SHARE;
  const isInk = Uint8Array.from(inks, (ink) => Number(ink > threshold));
  removeMaskSpecks(isInk, tracedWidth, tracedHeight, speckArea);
  const pixels = new Uint8ClampedArray(pixelCount * 4);
  for (const [pixel, ink] of isInk.entries()) {
    const { a, b, g, r } = ink ? INK : PAPER;
    pixels.set([r, g, b, a], pixel * 4);
  }
  const traced = ImageTracer.imagedataToSVG(
    { data: pixels, height: tracedHeight, width: tracedWidth },
    {
      colorsampling: 0,
      linefilter: false,
      ltres: 0.5,
      numberofcolors: 2,
      pal: [INK, PAPER],
      // Every path is kept: the mask holds no speck by now, and a part of the mark only a few points long is still one
      pathomit: 0,
      qtres: 0.5,
      roundcoords: 2,
    },
  );
  const inkPaths = Array.from(
    traced.matchAll(/<path[^>]*fill="rgb\(0,0,0\)"[^>]*\sd="(?<d>[^"]+)"/gu),
    ({ groups }) => groups?.d?.trim() ?? "",
  ).filter(Boolean);
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
  return inkPaths.join(" ");
};
