import type { WitnessGbuffer } from "#src/models/genshinParity/shared/WitnessGbuffer";

// The pixels where one family of the witness's parts meets another or the empty ground, as a mask, beside the index of
// The family each lies on (minus one where none): a boundary is a pixel whose right or lower neighbour holds another
// Family, so each edge is one pixel wide on the side of the family it bounds. Parts of one family meet at seams the
// Reference draws as cracks and joints, or not at all, so only a family's silhouette is an edge
export const findFamilyBoundaries = ({
  height,
  part,
  width,
}: Pick<WitnessGbuffer, "height" | "part" | "width">): { familyIndices: Int16Array; mask: Uint8Array } => {
  const mask = new Uint8Array(width * height);
  const familyIndices = new Int16Array(width * height).fill(-1);
  // A pixel's family, minus one on the ground
  const getFamily = (pixel: number): number => (part[pixel * 4] ? (part[pixel * 4 + 1] ?? -1) : -1);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const pixel = y * width + x;
      const family = getFamily(pixel);
      const right = x < width - 1 ? getFamily(pixel + 1) : family;
      const below = y < height - 1 ? getFamily(pixel + width) : family;
      if (right === family && below === family) continue;
      mask[pixel] = 1;
      // An edge on the empty ground belongs to the family it bounds, its right or lower neighbour
      familyIndices[pixel] = family === -1 ? (right === -1 ? below : right) : family;
    }
  return { familyIndices, mask };
};
