import { computeBoxSums } from "#src/services/recreation/image/computeBoxSums";

// The mask grown by a radius: a pixel is one where any pixel of the mask lies within the radius of it, each window counted
// From the one integral image `computeBoxSums` builds
export const dilateMask = (mask: ArrayLike<number>, width: number, height: number, radius: number): Uint8Array =>
  Uint8Array.from(computeBoxSums(mask, width, height, radius), (sum) => (sum > 0 ? 1 : 0));
