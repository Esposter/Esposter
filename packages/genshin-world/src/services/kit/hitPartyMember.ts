import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { absorbKitShield } from "#src/services/kit/effects/absorbKitShield";
import { damagePartyMember } from "#src/services/party/damagePartyMember";

// A hit of a set amount on the member on the field: the team's shields take it first, and what none of them absorbs is
// Taken from the member as the share of its Max HP it is. An enemy's strike, a boar's charge and the sheer cold's damage
// All land this way
export const hitPartyMember = (
  party: Party,
  combatant: Combatant,
  kitEffectState: KitEffectState,
  damage: number,
): void => {
  const { maxHealth } = combatant.attributes;
  const overflow = absorbKitShield(kitEffectState.effects, combatant, damage);
  damagePartyMember(party, combatant.characterId, overflow / maxHealth);
};
