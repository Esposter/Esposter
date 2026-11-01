import type { Level } from "#src/models/recreation/image/Level";

import { COLOUR_CHANNELS } from "#src/services/recreation/image/constants";

// A coarse cell is known where any of its children is, its colour the mean of those children that are known, so the
// Coarse level's boundary is the frame's ring averaged over each block, and its unknown cells the region's interior
export const getCoarserLevel = ({ height, known, values, width }: Level): Level => {
  const coarseWidth = Math.ceil(width / 2);
  const coarseHeight = Math.ceil(height / 2);
  const coarseKnown = new Uint8Array(coarseWidth * coarseHeight);
  const coarseValues = new Float64Array(coarseWidth * coarseHeight * COLOUR_CHANNELS);
  for (let row = 0; row < coarseHeight; row++)
    for (let column = 0; column < coarseWidth; column++) {
      const index = row * coarseWidth + column;
      let knownCount = 0;
      const sums = [0, 0, 0];
      for (let childRow = row * 2; childRow < Math.min(height, row * 2 + 2); childRow++)
        for (let childColumn = column * 2; childColumn < Math.min(width, column * 2 + 2); childColumn++) {
          const childIndex = childRow * width + childColumn;
          if (!known[childIndex]) continue;
          knownCount++;
          for (let channel = 0; channel < COLOUR_CHANNELS; channel++)
            sums[channel] = (sums[channel] ?? 0) + (values[childIndex * COLOUR_CHANNELS + channel] ?? 0);
        }
      coarseKnown[index] = Number(knownCount > 0);
      if (knownCount === 0) continue;
      for (let channel = 0; channel < COLOUR_CHANNELS; channel++)
        coarseValues[index * COLOUR_CHANNELS + channel] = (sums[channel] ?? 0) / knownCount;
    }
  return { height: coarseHeight, known: coarseKnown, values: coarseValues, width: coarseWidth };
};
