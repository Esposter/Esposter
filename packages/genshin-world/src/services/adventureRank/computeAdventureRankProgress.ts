import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";

import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { MAX_ADVENTURE_RANK } from "#src/services/adventureRank/constants";

// How far the Adventure EXP has come from the rank it is at toward the next, from none to one. A rank at its maximum has
// No next rank, so its bar is full
export const computeAdventureRankProgress = (
  { levels }: AdventureRankTables,
  adventureExp: number,
  rank: number,
): number => {
  if (rank >= MAX_ADVENTURE_RANK) return 1;
  const rankExp = computeAdventureExpAtRank(levels, rank);
  const nextRankExp = computeAdventureExpAtRank(levels, rank + 1);
  return Math.min(1, (adventureExp - rankExp) / (nextRankExp - rankExp));
};
