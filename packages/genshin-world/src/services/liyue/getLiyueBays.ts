import type { LiyueBay } from "#src/models/liyue/LiyueBay";

import { LIYUE_BAY_WIDTH } from "#src/services/liyue/constants";

// A wall's bays, spread evenly from one end of its length to the other, none wider than a bay
export const getLiyueBays = (length: number): LiyueBay[] => {
  const bayCount = Math.max(1, Math.ceil(length / LIYUE_BAY_WIDTH));
  const bayLength = length / bayCount;
  return Array.from({ length: bayCount }, (_, index) => ({
    end: -length / 2 + bayLength * (index + 1),
    start: -length / 2 + bayLength * index,
  }));
};
