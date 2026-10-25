import type { ExcelRewardRow } from "#src/models/genshinAssets/rewards/ExcelRewardRow";

import { InvalidOperationError, Operation } from "@esposter/shared";

// A reward row the reward table must hold, read for the level or the pool that names it
export const readReward = (
  rewardMap: ReadonlyMap<number, ExcelRewardRow>,
  rewardId: number,
  named: string,
): ExcelRewardRow => {
  const reward = rewardMap.get(rewardId);
  if (!reward)
    throw new InvalidOperationError(
      Operation.Read,
      "offering reward",
      `${named} names reward ${rewardId}, which the reward table does not hold`,
    );
  return reward;
};
