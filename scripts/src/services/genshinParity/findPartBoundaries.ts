import type { WitnessGbuffer } from "#src/models/genshinParity/WitnessGbuffer";

// The pixels where one part of the witness meets another or the empty ground, as a mask, beside the family index of the
// Part each lies on (minus one where none): a boundary is a drawn pixel whose right or lower neighbour holds another
// Part, so each edge is one pixel wide on the side of the part it bounds
export const findPartBoundaries = ({
  height,
  part,
  width,
}: Pick<WitnessGbuffer, "height" | "part" | "width">): { familyIndices: Int16Array; mask: Uint8Array } => {
  const mask = new Uint8Array(width * height);
  const familyIndices = new Int16Array(width * height).fill(-1);
  const readPart = (pixel: number): number => part[pixel * 4] ?? 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const pixel = y * width + x;
      const id = readPart(pixel);
      const isBoundary =
        (x < width - 1 && readPart(pixel + 1) !== id) || (y < height - 1 && readPart(pixel + width) !== id);
      if (!isBoundary) continue;
      mask[pixel] = 1;
      // An edge on the empty ground belongs to the part it bounds, its right or lower neighbour
      const drawnPixel = id ? pixel : readPart(pixel + 1) && x < width - 1 ? pixel + 1 : pixel + width;
      familyIndices[pixel] = readPart(drawnPixel) ? (part[drawnPixel * 4 + 1] ?? -1) : -1;
    }
  return { familyIndices, mask };
};
