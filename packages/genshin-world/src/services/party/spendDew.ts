import type { Party } from "#src/models/party/Party";

// Spends up to a number of the party's Dew, its Verdant Dew first and then its Moonridge Dew, as gcsim's ConsumeDew does,
// Written in place, and returns how many it spent
export const spendDew = (party: Party, maximumCount: number): number => {
  const verdantCount = Math.min(party.verdantDew.count, maximumCount);
  party.verdantDew.count -= verdantCount;
  const moonridgeCount = Math.min(party.moonridgeDew, maximumCount - verdantCount);
  party.moonridgeDew -= moonridgeCount;
  return verdantCount + moonridgeCount;
};
