import type { Combatant } from "#src/models/kit/Combatant";
import type { Party } from "#src/models/party/Party";

import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { getPartyMember } from "#src/services/party/getPartyMember";

// A flat amount of energy a passive, a constellation or an enemy's drop gives one member of the party, up to what its
// Burst costs. A fallen member gains none, as it has lost its energy
export const gainPartyMemberEnergy = (party: Party, { characterId, kit }: Combatant, energy: number): void => {
  if (checkIsCharacterDown(party, characterId)) return;
  const partyMember = getPartyMember(party, characterId);
  partyMember.energy = Math.min(kit.burstEnergyCost, partyMember.energy + energy);
};
