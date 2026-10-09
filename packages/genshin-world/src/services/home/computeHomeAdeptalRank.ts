import type { HomeComfortLevel } from "#src/models/home/HomeComfortLevel";

import { HOME_MINIMUM_RANK } from "#src/services/home/constants";

// The Adeptal Energy rank a realm's comfort reaches: the last rank whose comfort the total passes. The ranks are read in
// Their order, lowest first, and the lowest rank's comfort is zero, so every realm reads as at least the minimum
export const computeHomeAdeptalRank = (comfort: number, levels: HomeComfortLevel[]): number =>
  levels.findLast((level) => level.comfort <= comfort)?.level ?? HOME_MINIMUM_RANK;
