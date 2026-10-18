import type { AdventureRankLevel } from "#src/models/adventureRank/AdventureRankLevel";
import type { QuestRewardItem } from "#src/models/quest/Quest";

// The rewards Katheryne gives when she is spoken to: each reached rank whose reward is not yet claimed pays its items
// Once, and every reached rank is then claimed, so a second talk gives nothing. Returns the claimed ranks, with the ones
// Given now, sorted, for the save to keep
export const claimRankRewards = (
  levels: readonly AdventureRankLevel[],
  rank: number,
  claimedRanks: readonly number[],
): { claimedRanks: number[]; rewards: QuestRewardItem[] } => {
  const reachedRanks = Array.from({ length: rank - 1 }, (_, index) => index + 2);
  const rewards = reachedRanks
    .filter((reachedRank) => !claimedRanks.includes(reachedRank))
    .flatMap((unclaimedRank) => levels.find(({ level }) => level === unclaimedRank)?.rewardItems ?? []);
  return {
    claimedRanks: [...new Set([...claimedRanks, ...reachedRanks])].toSorted(
      (firstRank, secondRank) => firstRank - secondRank,
    ),
    rewards,
  };
};
