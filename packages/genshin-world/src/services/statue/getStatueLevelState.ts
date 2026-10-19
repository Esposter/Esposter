import { WorshipLevelState } from "genshin-interface";

// A level's state on the Worship Statue, read against the level the region has reached and the level its rewards are
// Claimed through
export const getStatueLevelState = (level: number, reachedLevel: number, claimedLevel: number): WorshipLevelState => {
  if (level <= claimedLevel) return WorshipLevelState.Claimed;
  if (level <= reachedLevel) return WorshipLevelState.Claimable;
  return WorshipLevelState.Locked;
};
