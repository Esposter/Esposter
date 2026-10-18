import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { InvalidOperationError, Operation } from "@esposter/shared";

// The reward a row names, read from the reward table, an unlisted one being an error since a level, request, bounty or
// Quest without its reward would pay silently wrong
export const readReward = (rewardMap: Map<number, ExcelRewardRow>, rewardId: number, owner: string): ExcelRewardRow => {
  const reward = rewardMap.get(rewardId);
  if (!reward)
    throw new InvalidOperationError(
      Operation.Read,
      "reputation reward",
      `${owner} names reward ${rewardId}, which the reward table does not hold`,
    );
  return reward;
};
