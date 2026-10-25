import { InvalidOperationError, Operation } from "@esposter/shared";

// The reward a row names, read from the reward table
// An unlisted one is an error, since a level, request, bounty or quest without its reward would pay silently wrong
export const readReward = <Row>(rewardMap: ReadonlyMap<number, Row>, rewardId: number, named: string): Row => {
  const reward = rewardMap.get(rewardId);
  if (!reward)
    throw new InvalidOperationError(
      Operation.Read,
      "reward",
      `${named} names reward ${rewardId}, which the reward table does not hold`,
    );
  return reward;
};
