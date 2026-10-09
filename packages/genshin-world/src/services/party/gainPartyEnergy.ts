import type { EnergyRecipient } from "#src/models/combat/EnergyRecipient";
import type { Element } from "#src/models/Element";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";
import type { Combatant } from "#src/models/kit/Combatant";
import type { Party } from "#src/models/party/Party";

import { Attribute } from "#src/models/character/Attribute";
import { getEnergyGain } from "#src/services/combat/energy/getEnergyGain";
import { checkIsCharacterDown } from "#src/services/party/checkIsCharacterDown";
import { getActiveCharacterId } from "#src/services/party/getActiveCharacterId";
import { getPartyMember } from "#src/services/party/getPartyMember";

// An enemy's drop of energy, written into each standing member of the deployed team: the drop's count of what each one
// Gains from it, by its element, its energy recharge and whether it is on the field, up to what its burst costs. A
// Fallen member gains none, as it has lost its energy, and nor does one whose combatant is not built yet, its talent
// Multipliers still in flight
export const gainPartyEnergy = (
  party: Party,
  { count, energyDropKind }: EnergyDrop,
  dropElement: Element | undefined,
  characterIdCombatantMap: Map<number, Combatant>,
): void => {
  const characterIds = party.teams[party.deployedTeamIndex]?.characterIds ?? [];
  const activeCharacterId = getActiveCharacterId(party);
  for (const characterId of characterIds) {
    if (checkIsCharacterDown(party, characterId)) continue;
    const combatant = characterIdCombatantMap.get(characterId);
    if (!combatant) continue;
    const recipient: EnergyRecipient = {
      element: combatant.element,
      energyRecharge: combatant.attributes.attributeTotalMap[Attribute.EnergyRecharge],
      isActive: characterId === activeCharacterId,
      partySize: characterIds.length,
    };
    const partyMember = getPartyMember(party, characterId);
    const gain = count * getEnergyGain(energyDropKind, recipient, dropElement);
    partyMember.energy = Math.min(combatant.kit.burstEnergyCost, partyMember.energy + gain);
  }
};
