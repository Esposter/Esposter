import type { CellReading } from "#src/models/genshinParity/reference/CellReading";

import { RGB_CHANNEL_COUNT } from "#src/services/genshinParity/probe/constants";
import { toMeanColour } from "#src/services/genshinParity/reference/toMeanColour";
import { toPercent } from "#src/services/genshinParity/reference/toPercent";
import { roundHundredths } from "#src/services/genshinParity/shared/roundHundredths";

interface CellSum {
  count: number;
  difference: number;
  ours: number[];
  reference: number[];
}

// The compared region split into a grid of cells, row by row from the top, each read over its scored pixels: the mean of
// The greyscale difference in percent, and the mean colour of the reference and of ours, with the whole region's mean
// Difference over its scored pixels. `differences` is the greyscale difference per pixel, and the two RGB buffers are
// Each image's pixels in the same order
export const getCellReadings = ({
  differences,
  gridSize,
  height,
  referenceRgb,
  scoredMask,
  shotRgb,
  width,
}: {
  differences: Uint8Array;
  gridSize: number;
  height: number;
  referenceRgb: Uint8Array;
  scoredMask: Uint8Array;
  shotRgb: Uint8Array;
  width: number;
}): { cells: CellReading[]; meanDifference: number } => {
  const sums: CellSum[] = Array.from({ length: gridSize * gridSize }, () => ({
    count: 0,
    difference: 0,
    ours: Array.from({ length: RGB_CHANNEL_COUNT }, () => 0),
    reference: Array.from({ length: RGB_CHANNEL_COUNT }, () => 0),
  }));
  for (let index = 0; index < differences.length; index++) {
    if (!scoredMask[index]) continue;
    const column = Math.min(gridSize - 1, Math.floor(((index % width) / width) * gridSize));
    const row = Math.min(gridSize - 1, Math.floor((Math.floor(index / width) / height) * gridSize));
    const sum = sums[row * gridSize + column];
    if (!sum) continue;
    sum.count++;
    sum.difference += differences[index] ?? 0;
    for (let channel = 0; channel < RGB_CHANNEL_COUNT; channel++) {
      const offset = index * RGB_CHANNEL_COUNT + channel;
      sum.reference[channel] = (sum.reference[channel] ?? 0) + (referenceRgb[offset] ?? 0);
      sum.ours[channel] = (sum.ours[channel] ?? 0) + (shotRgb[offset] ?? 0);
    }
  }
  const scoredCount = sums.reduce((count, sum) => count + sum.count, 0);
  const total = sums.reduce((sum, cell) => sum + cell.difference, 0);
  const cells = sums.map(({ count, difference, ours, reference }, index): CellReading => ({
    cell: [index % gridSize, Math.floor(index / gridSize)],
    error: roundHundredths(toPercent(difference, count)),
    ours: toMeanColour(ours, count),
    reference: toMeanColour(reference, count),
  }));
  return { cells, meanDifference: toPercent(total, scoredCount) };
};
