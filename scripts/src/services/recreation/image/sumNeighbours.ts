import { COLOUR_CHANNELS } from "#src/services/recreation/image/constants";
import { getNeighbourPixels } from "#src/services/recreation/image/getNeighbourPixels";

// The colours of a cell's neighbours inside the level are added to the sums, and their count returned
export const sumNeighbours = (
  values: Float64Array,
  width: number,
  height: number,
  index: number,
  sums: Float64Array,
) => {
  const neighbours = getNeighbourPixels(index, width, height);
  for (const neighbour of neighbours)
    for (let channel = 0; channel < COLOUR_CHANNELS; channel++)
      sums[channel] = (sums[channel] ?? 0) + (values[neighbour * COLOUR_CHANNELS + channel] ?? 0);
  return neighbours.length;
};
