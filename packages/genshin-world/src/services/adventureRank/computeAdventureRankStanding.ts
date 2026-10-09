import type { AdventureRankStanding } from "#src/models/adventureRank/AdventureRankStanding";
import type { AdventureRankTables } from "#src/models/adventureRank/AdventureRankTables";

import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";

// The rank and World Level a player stands at with their Adventure EXP and the main quests they have done. The World
// Levels open in order: each needs the rank the one before it capped, and its quest done where it names one. The rank
// Is the EXP's own, held at the cap the last open World Level sets, so a quest held back is what keeps it there
export const computeAdventureRankStanding = (
  { levels, locks }: AdventureRankTables,
  adventureExp: number,
  completedMainQuestIds: ReadonlySet<string>,
): AdventureRankStanding => {
  // Every rank whose EXP is reached, rank 1 among them since it is reached at none
  const expRank = levels.filter(({ level }) => computeAdventureExpAtRank(levels, level) <= adventureExp).length;
  let rankCap = 0;
  let worldLevel = 0;
  for (const { rankCap: lockRankCap, unlockMainQuestId, unlockPlayerLevel, worldLevel: lockWorldLevel } of locks) {
    const reachedRank = Math.min(expRank, rankCap);
    if (reachedRank < unlockPlayerLevel) break;
    if (unlockMainQuestId && !completedMainQuestIds.has(unlockMainQuestId)) break;
    rankCap = lockRankCap;
    worldLevel = lockWorldLevel;
  }
  return { rank: Math.min(expRank, rankCap), rankCap, worldLevel };
};
