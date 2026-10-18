import type { HomeFavour } from "#src/models/home/HomeFavour";
import type { HomeProgress } from "#src/models/home/HomeProgress";

// The companion's talk for a favoured gift set, and its one-time reward unless the realm has already given it, with the
// Progress that records the reward as given. Undefined, with nothing given, where the companion does not live in the realm
export const giveHomeFavour = (
  favour: HomeFavour,
  progress: HomeProgress,
): undefined | { progress: HomeProgress; rewardId?: number; talkId: number } => {
  if (!progress.companionIds.includes(favour.avatarId)) return undefined;
  if (progress.claimedRewardIds.includes(favour.rewardId)) return { progress, talkId: favour.talkId };
  return {
    progress: { ...progress, claimedRewardIds: [...progress.claimedRewardIds, favour.rewardId] },
    rewardId: favour.rewardId,
    talkId: favour.talkId,
  };
};
