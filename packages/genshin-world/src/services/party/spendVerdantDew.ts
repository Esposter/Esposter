import type { Party } from "#src/models/party/Party";

// Spends up to a number of the party's Verdant Dew, written in place, and returns how many it spent
export const spendVerdantDew = ({ verdantDew }: Party, maximumCount: number): number => {
  const count = Math.min(verdantDew.count, maximumCount);
  verdantDew.count -= count;
  return count;
};
