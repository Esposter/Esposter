import type { ImageRegion } from "#src/models/recreation/image/ImageRegion";

import { CHANNELS, COLOUR_CHANNELS } from "#src/services/recreation/image/constants";
import { getFinestLevel } from "#src/services/recreation/image/getFinestLevel";
import { solveLevel } from "#src/services/recreation/image/solveLevel";

// The region's pixels replaced by the harmonic fill of their surroundings, per colour channel: the solution of
// Laplace's equation inside the region, with the pixels just outside it as its boundary. A linear gradient around the
// Region is therefore the gradient inside it, and a flat border fills flat. Alpha and every pixel outside the region
// Are kept as they are. The region must have a pixel outside it to fill from, which the caller checks
export const fillRegionHarmonically = (pixels: Uint8Array, width: number, height: number, region: ImageRegion) => {
  const filled = Uint8Array.from(pixels);
  const finest = getFinestLevel(pixels, width, height, region);
  solveLevel(finest);
  for (let row = 0; row < finest.height; row++)
    for (let column = 0; column < finest.width; column++) {
      const index = row * finest.width + column;
      if (finest.known[index]) continue;
      const pixelIndex = ((finest.top + row) * width + finest.left + column) * CHANNELS;
      for (let channel = 0; channel < COLOUR_CHANNELS; channel++)
        filled[pixelIndex + channel] = Math.min(
          255,
          Math.max(0, Math.round(finest.values[index * COLOUR_CHANNELS + channel] ?? 0)),
        );
    }
  return filled;
};
