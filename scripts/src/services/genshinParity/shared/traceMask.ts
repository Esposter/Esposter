import { compactSvgPath } from "#src/services/genshinParity/shared/compactSvgPath";
import { SPECK_SHARE } from "#src/services/genshinParity/shared/constants";
import { removeMaskSpecks } from "#src/services/genshinParity/shared/removeMaskSpecks";
import ImageTracer from "imagetracerjs";

const INK = { a: 255, b: 0, g: 0, r: 0 };
const PAPER = { a: 255, b: 255, g: 255, r: 255 };
// A mask's ink as filled paths, its specks cleared first and its outlines traced into curves: every path of a mark split
// From its ground, one path a run of ink or a hole in one, to be drawn together with the even-odd rule. The paths are in
// The mask's pixels unless the caller draws in units of its own, each coordinate then scaled while the path is still
// Absolute and spaced, before its compact form runs numbers together
export const traceMask = (
  isInk: Uint8Array,
  width: number,
  height: number,
  { decimals = 2, unitsPerPixel = 1 }: { decimals?: number; unitsPerPixel?: number } = {},
): string[] => {
  removeMaskSpecks(isInk, width, height, width * height * SPECK_SHARE);
  const pixels = new Uint8ClampedArray(isInk.length * 4);
  for (const [pixel, ink] of isInk.entries()) {
    const { a, b, g, r } = ink ? INK : PAPER;
    pixels.set([r, g, b, a], pixel * 4);
  }
  const traced = ImageTracer.imagedataToSVG(
    { data: pixels, height, width },
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
  return Array.from(traced.matchAll(/<path[^>]*fill="rgb\(0,0,0\)"[^>]*\sd="(?<d>[^"]+)"/gu), ({ groups }) =>
    compactSvgPath(
      (groups?.d?.trim() ?? "").replaceAll(/\d+(?:\.\d+)?/gu, (coordinate) =>
        String(Number((Number(coordinate) * unitsPerPixel).toFixed(decimals))),
      ),
    ),
  ).filter(Boolean);
};
