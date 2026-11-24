import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

// Whether a pixel of a target `targetWidth` pixels wide stands inside a reference's scored region, the region scaled
// From the reference's width to the target's, so a tool reads nothing a recording masks
export const checkIsScoredPixel = (
  region: ImageRegion,
  referenceWidth: number,
  pixel: number,
  targetWidth: number,
): boolean => {
  const scale = targetWidth / referenceWidth;
  const [column, row] = [pixel % targetWidth, Math.floor(pixel / targetWidth)];
  return (
    column >= region.x * scale &&
    column < (region.x + region.width) * scale &&
    row >= region.y * scale &&
    row < (region.y + region.height) * scale
  );
};
