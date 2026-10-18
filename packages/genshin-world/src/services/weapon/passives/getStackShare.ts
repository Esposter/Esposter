import { takeOne } from "@esposter/shared";

// The share a count of stacks reaches on a ladder of shares: none for no stack, the first share for one, and the last share
// For that many or more
export const getStackShare = (shares: number[], stacks: number): number =>
  stacks === 0 ? 0 : takeOne(shares, Math.min(stacks, shares.length) - 1);
