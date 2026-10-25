import type { Haze } from "#src/models/genshinParity/witness/Haze";
import type { StoneLightReading } from "#src/models/genshinParity/witness/StoneLightReading";

import { computeFogOpacity } from "#src/services/genshinParity/sky/computeFogOpacity";
import { computeHazeResidual } from "#src/services/genshinParity/witness/computeHazeResidual";

// What a haze leaves unexplained over every reading, each sample hidden by it as much as it integrates to along the
// Ray, each reading weighed alike
export const computeReadingsResidual = (readings: readonly StoneLightReading[], haze: Haze): number => {
  let squared = 0;
  for (const { eye, fog, pixels, whiteBalance } of readings) {
    const hazeFog = { ...fog, ...haze };
    for (const { point, sample } of pixels) sample.opacity = computeFogOpacity(eye, point, hazeFog);
    squared +=
      computeHazeResidual(
        pixels.map(({ sample }) => sample),
        whiteBalance,
      ) ** 2;
  }
  return Math.sqrt(squared / Math.max(readings.length, 1));
};
