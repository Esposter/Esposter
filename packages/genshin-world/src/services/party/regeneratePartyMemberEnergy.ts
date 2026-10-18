import type { Combatant } from "#src/models/kit/Combatant";
import type { Party } from "#src/models/party/Party";

import { Attribute } from "#src/models/character/Attribute";
import { gainPartyMemberEnergy } from "#src/services/party/gainPartyMemberEnergy";

// Energy a passive or a constellation regenerates for one member, raised by its Energy Recharge as a particle's energy is,
// And up to what its burst costs
export const regeneratePartyMemberEnergy = (party: Party, combatant: Combatant, energy: number): void =>
  gainPartyMemberEnergy(party, combatant, energy * combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge]);
