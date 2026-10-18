import type { ReputationReward } from "#src/models/reputation/ReputationReward";
import type { ReputationRequest } from "#src/models/reputation/ReputationRequest";

// The quest and reward each Reputation request binds, one per quest: a quest the groups of several levels name is bound
// By its first row, so its reward pays once when the quest finishes
export const getReputationRequestBindings = (
  requests: readonly ReputationRequest[],
): { questId: number; reward: ReputationReward }[] =>
  requests
    .filter(({ questId }, index) => requests.findIndex((request) => request.questId === questId) === index)
    .map(({ questId, reward }) => ({ questId, reward }));
