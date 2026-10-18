import type { ReputationReward } from "#src/models/reputation/ReputationReward";

// A bounty claimed back with the keeper: the reward it pays, and the moments the bounty claims stand at once it is claimed
export interface ReputationBountyClaim {
  claimedAts: Temporal.Instant[];
  reward: ReputationReward;
}
