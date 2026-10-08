import type { LiyueBay } from "#src/models/kits/liyue/LiyueBay";

import { BAY_WIDTH } from "#src/kits/liyue/constants";

// A wall's bays, spread evenly from one end of its length to the other, none wider than a bay
export const getLiyueBays = (length: number): LiyueBay[] => {
  const bayCount = Math.max(1, Math.ceil(length / BAY_WIDTH));
  const bayLength = length / bayCount;
  return Array.from({ length: bayCount }, (_, index) => ({
    end: -length / 2 + bayLength * (index + 1),
    start: -length / 2 + bayLength * index,
  }));
};
