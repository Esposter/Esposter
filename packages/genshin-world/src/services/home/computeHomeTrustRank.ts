import type { HomeTrustLevel } from "#src/models/home/HomeTrustLevel";

import { HOME_MINIMUM_RANK } from "#src/services/home/constants";

// The Trust Rank a total of Trust EXP reaches. Each rank is passed once the EXP of every rank before it is held, so a rank's
// Threshold is the sum of the EXP of the ranks below it, and the rank is the last whose threshold the total passes. The
// Levels are read in their order, lowest first
export const computeHomeTrustRank = (trustExp: number, levels: HomeTrustLevel[]): number => {
  let rank = HOME_MINIMUM_RANK;
  let threshold = 0;
  for (const level of levels) {
    if (threshold > trustExp) break;
    rank = level.level;
    threshold += level.exp;
  }
  return rank;
};
