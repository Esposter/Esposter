import type { ParityRegion } from "#src/models/genshinParity/shared/ParityRegion";

// The pixels a comparison scores, read on a raster of the given size over the region: 1 where the middle of the raster
// pixel lies in one of the rectangles, which are in the reference's own pixels. A raster smaller than the region, such
// as FLIP's, takes each pixel at the place its middle has in the region
export const computeScoredMask = (
  rectangles: ParityRegion[],
  region: ParityRegion,
  width: number,
  height: number,
): Uint8Array => {
  const mask = new Uint8Array(width * height);
  for (let row = 0; row < height; row++)
    for (let column = 0; column < width; column++) {
      const x = region.x + ((column + 0.5) / width) * region.width;
      const y = region.y + ((row + 0.5) / height) * region.height;
      mask[row * width + column] = Number(
        rectangles.some(
          (rectangle) =>
            x >= rectangle.x &&
            x < rectangle.x + rectangle.width &&
            y >= rectangle.y &&
            y < rectangle.y + rectangle.height,
        ),
      );
    }
  return mask;
};
