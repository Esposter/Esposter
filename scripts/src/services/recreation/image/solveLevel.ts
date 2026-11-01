import type { Level } from "#src/models/recreation/image/Level";

import { COARSEST_SIDE } from "#src/services/recreation/image/constants";
import { getCoarserLevel } from "#src/services/recreation/image/getCoarserLevel";
import { prolongInto } from "#src/services/recreation/image/prolongInto";
import { relax } from "#src/services/recreation/image/relax";

// Multigrid in its coarse-to-fine form: the coarser level is solved first, its solution carried down as the start, and
// Each level relaxed on top, so the low frequencies are already right where the finest level's relaxation begins
export const solveLevel = (level: Level): void => {
  if (Math.max(level.width, level.height) > COARSEST_SIDE) {
    const coarse = getCoarserLevel(level);
    solveLevel(coarse);
    prolongInto(coarse, level);
  }
  relax(level);
};
