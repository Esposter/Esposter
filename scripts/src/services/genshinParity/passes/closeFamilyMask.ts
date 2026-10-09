import { computeBoxSums } from "#src/services/genshinParity/passes/computeBoxSums";

// A family's pixels closed at a radius: every pixel within the radius of one of them, then the result eroded by the
// Same radius, so the gaps a card's width or less across close over and the canopy reads as one mass
export const closeFamilyMask = (mask: ArrayLike<number>, width: number, height: number, radius: number): Uint8Array => {
  const dilated = Uint8Array.from(computeBoxSums(mask, width, height, radius), (sum) => (sum > 0 ? 1 : 0));
  const dilatedSums = computeBoxSums(dilated, width, height, radius);
  const areas = computeBoxSums(new Uint8Array(width * height).fill(1), width, height, radius);
  return Uint8Array.from(dilatedSums, (sum, pixel) => (sum === areas[pixel] ? 1 : 0));
};
