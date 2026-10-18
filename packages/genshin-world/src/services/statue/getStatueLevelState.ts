import type { StatueLevelState } from "#src/models/statue/StatueLevelState";

// A level's state on the Worship Statue, read against the level the region has reached and the level its rewards are
// Claimed through
export const getStatueLevelState = (level: number, reachedLevel: number, claimedLevel: number): StatueLevelState => {
  if (level <= claimedLevel) return "claimed";
  if (level <= reachedLevel) return "claimable";
  return "locked";
};
