import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

// Whether one of the regions covers the whole frame, which leaves no border for a clean plate to fill from
export const isWholeFrameCovered = (
  regions: ImageRegion[],
  { height, width }: { height: number; width: number },
): boolean =>
  regions.some((region) => region.x === 0 && region.y === 0 && region.width >= width && region.height >= height);
