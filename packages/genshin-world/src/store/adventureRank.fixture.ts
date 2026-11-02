import { computeAdventureExpAtRank } from "#src/services/adventureRank/computeAdventureExpAtRank";
import { useWorldAdventureRankStore } from "#src/store/adventureRank";

// The adventure rank store started at exactly this rank, over made-up tables of one thousand Adventure EXP a rank and a
// Single World Level that caps there, for a suite that tests a feature reading it. Start the session store first
export const startTestAdventureRank = (rank = 1) => {
  const levels = Array.from({ length: rank }, (_value, index) => ({ exp: 1000, level: index + 1, rewardItems: [] }));
  const worldAdventureRankStore = useWorldAdventureRankStore();
  worldAdventureRankStore.start(
    {
      levels,
      locks: [{ rankCap: rank, unlockMainQuestId: "", unlockPlayerLevel: 0, worldLevel: 1 }],
      worldLevelRows: [],
    },
    {
      adventureExp: computeAdventureExpAtRank(levels, rank),
      adventureRankRewardsClaimed: [],
      worldLevelAdjustment: { isLowered: false },
    },
  );
  return worldAdventureRankStore;
};
