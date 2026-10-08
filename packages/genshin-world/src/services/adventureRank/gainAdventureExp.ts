import type { AdventureExpGain } from "#src/models/adventureRank/AdventureExpGain";

import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { computeAdventureRankStanding } from "#src/services/adventureRank/computeAdventureRankStanding";
import { MAX_ADVENTURE_RANK, MORA_PER_EXCESS_ADVENTURE_EXP } from "#src/services/adventureRank/constants";

// Adds Adventure EXP. It accrues up to the EXP rank 60 is reached at, even while a quest holds the rank lower, and what
// Passes it is paid in Mora once the rank cap is 60. Where the cap is lower, the EXP past the total is not gained
export const gainAdventureExp = (
  adventureExp: number,
  amount: number,
  completedMainQuestIds: ReadonlySet<string>,
): AdventureExpGain => {
  const { rankCap } = computeAdventureRankStanding(adventureExp, completedMainQuestIds);
  const maxAdventureExp = computeAdventureExpAtRank(MAX_ADVENTURE_RANK);
  const nextAdventureExp = Math.min(adventureExp + amount, maxAdventureExp);
  const excessAdventureExp = adventureExp + amount - nextAdventureExp;
  return {
    adventureExp: nextAdventureExp,
    moraPaid: rankCap === MAX_ADVENTURE_RANK ? excessAdventureExp * MORA_PER_EXCESS_ADVENTURE_EXP : 0,
  };
};
