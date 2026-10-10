import type { Combatant } from "#src/models/kit/Combatant";
import type { Party } from "#src/models/party/Party";

import { getPartyMember } from "#src/services/party/getPartyMember";

// A flat amount of energy a passive or a constellation gives one member of the party, up to what its burst costs
export const gainPartyMemberEnergy = (party: Party, { characterId, kit }: Combatant, energy: number): void => {
  const partyMember = getPartyMember(party, characterId);
  partyMember.energy = Math.min(kit.burstEnergyCost, partyMember.energy + energy);
};
