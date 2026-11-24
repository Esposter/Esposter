import { InvalidOperationError, Operation } from "@esposter/shared";

// A reward's count as its preview spells it: one number for a fixed count.
// Two numbers joined by a semicolon are the least and the most a claim may draw.
// A count with an empty part is an error, since Number reads an empty part as zero.
// So is a count with more than two parts, one that is not whole, or one whose least is above its most.
export const parseRewardCount = (count: string): { maxCount: number; minCount: number } => {
  const parts = count.split(";");
  const [least, most = least] = parts;
  const minCount = Number(least);
  const maxCount = Number(most);
  if (
    parts.length > 2 ||
    parts.includes("") ||
    !Number.isInteger(minCount) ||
    !Number.isInteger(maxCount) ||
    minCount > maxCount
  )
    throw new InvalidOperationError(Operation.Read, "reward count", count);
  return { maxCount, minCount };
};
