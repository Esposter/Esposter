import { COLOUR_CHANNELS } from "#src/services/recreation/image/constants";

// The colours of a cell's neighbours inside the level are added to the sums, and their count returned
export const sumNeighbours = (
  values: Float64Array,
  width: number,
  height: number,
  index: number,
  sums: Float64Array,
): number => {
  const column = index % width;
  const row = Math.floor(index / width);
  const neighbourIndexes = [
    column > 0 ? index - 1 : -1,
    column < width - 1 ? index + 1 : -1,
    row > 0 ? index - width : -1,
    row < height - 1 ? index + width : -1,
  ];
  let neighbourCount = 0;
  for (const neighbourIndex of neighbourIndexes) {
    if (neighbourIndex === -1) continue;
    neighbourCount++;
    for (let channel = 0; channel < COLOUR_CHANNELS; channel++)
      sums[channel] = (sums[channel] ?? 0) + (values[neighbourIndex * COLOUR_CHANNELS + channel] ?? 0);
  }
  return neighbourCount;
};
