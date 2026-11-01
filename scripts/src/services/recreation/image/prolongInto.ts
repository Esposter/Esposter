import type { Level } from "#src/models/recreation/image/Level";

import { COLOUR_CHANNELS } from "#src/services/recreation/image/constants";

// Each unknown cell takes its coarse parent's solved colour as its start, so the relaxation below only smooths
export const prolongInto = (coarse: Level, fine: Level): void => {
  for (let row = 0; row < fine.height; row++)
    for (let column = 0; column < fine.width; column++) {
      const index = row * fine.width + column;
      if (fine.known[index]) continue;
      const coarseIndex = (row >> 1) * coarse.width + (column >> 1);
      for (let channel = 0; channel < COLOUR_CHANNELS; channel++)
        fine.values[index * COLOUR_CHANNELS + channel] = coarse.values[coarseIndex * COLOUR_CHANNELS + channel] ?? 0;
    }
};
