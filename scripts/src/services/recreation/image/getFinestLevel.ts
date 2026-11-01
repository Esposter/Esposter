import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";
import type { Level } from "#src/models/recreation/image/Level";

import { CHANNELS, COLOUR_CHANNELS } from "#src/services/recreation/image/constants";

// The level's pixels just outside the region are its boundary, known from the frame, and the region's own are unknown.
// Built over the region and its one-pixel ring, clipped to the frame, so a region on a frame edge has no ring there
export const getFinestLevel = (pixels: Uint8Array, width: number, height: number, region: ImageRegion): Level => {
  const left = Math.max(0, region.x - 1);
  const top = Math.max(0, region.y - 1);
  const levelWidth = Math.min(width, region.x + region.width + 1) - left;
  const levelHeight = Math.min(height, region.y + region.height + 1) - top;
  const known = new Uint8Array(levelWidth * levelHeight);
  const values = new Float64Array(levelWidth * levelHeight * COLOUR_CHANNELS);
  for (let row = 0; row < levelHeight; row++)
    for (let column = 0; column < levelWidth; column++) {
      const frameX = left + column;
      const frameY = top + row;
      const index = row * levelWidth + column;
      const isInside =
        frameX >= region.x &&
        frameX < region.x + region.width &&
        frameY >= region.y &&
        frameY < region.y + region.height;
      known[index] = Number(!isInside);
      const pixelIndex = (frameY * width + frameX) * CHANNELS;
      for (let channel = 0; channel < COLOUR_CHANNELS; channel++)
        values[index * COLOUR_CHANNELS + channel] = pixels[pixelIndex + channel] ?? 0;
    }
  return { height: levelHeight, known, values, width: levelWidth };
};
