import type { Party } from "#src/models/party/Party";

import { getPartyMember } from "#src/services/party/getPartyMember";

// The energy a member spends on a passive's cost, if it holds as much as the cost asks, and whether it spent it
export const spendPartyMemberEnergy = (party: Party, characterId: number, energy: number): boolean => {
  const partyMember = getPartyMember(party, characterId);
  if (partyMember.energy < energy) return false;
  partyMember.energy -= energy;
  return true;
};
