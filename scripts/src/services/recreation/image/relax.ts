import type { Level } from "#src/models/recreation/image/Level";

import { COLOUR_CHANNELS, RELAX_SWEEP_LIMIT, SETTLED_CHANGE } from "#src/services/recreation/image/constants";
import { sumNeighbours } from "#src/services/recreation/image/sumNeighbours";

// Gauss-Seidel sweeps: each unknown cell becomes the mean of its neighbours inside the level, so the solution is
// Harmonic, Laplace's equation with the boundary's values, and a level's neighbours outside it are simply not counted
export const relax = ({ height, known, values, width }: Level): void => {
  const sums = new Float64Array(COLOUR_CHANNELS);
  for (let sweep = 0; sweep < RELAX_SWEEP_LIMIT; sweep++) {
    let largestChange = 0;
    for (let index = 0; index < known.length; index++) {
      if (known[index]) continue;
      sums.fill(0);
      const neighbourCount = sumNeighbours(values, width, height, index, sums);
      for (let channel = 0; channel < COLOUR_CHANNELS; channel++) {
        const valueIndex = index * COLOUR_CHANNELS + channel;
        const solved = (sums[channel] ?? 0) / neighbourCount;
        largestChange = Math.max(largestChange, Math.abs(solved - (values[valueIndex] ?? 0)));
        values[valueIndex] = solved;
      }
    }
    if (largestChange < SETTLED_CHANGE) return;
  }
};
