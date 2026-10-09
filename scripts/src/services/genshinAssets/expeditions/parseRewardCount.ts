import { InvalidOperationError, Operation } from "@esposter/shared";

// A reward's count as its preview spells it: one number for a fixed count, or two joined by a semicolon for the least and
// The most a claim may draw. A count that is not whole, or whose least is above its most, is an error
export const parseRewardCount = (count: string): { maxCount: number; minCount: number } => {
  const [least, most] = count.split(";");
  const minCount = Number(least);
  const maxCount = most === undefined ? minCount : Number(most);
  if (!Number.isInteger(minCount) || !Number.isInteger(maxCount) || minCount > maxCount)
    throw new InvalidOperationError(Operation.Read, "reward count", count);
  return { maxCount, minCount };
};
