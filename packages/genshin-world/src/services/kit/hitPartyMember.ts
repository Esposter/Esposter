import type { Element } from "#src/models/Element";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { createKitFallRefusal } from "#src/services/kit/createKitFallRefusal";
import { absorbKitShield } from "#src/services/kit/effects/absorbKitShield";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { damagePartyMember } from "#src/services/party/damagePartyMember";

// A hit of a set amount on the member on the field: the team's shields take it first, each against the hit's element at
// The member's Shield Strength as its buffs leave it, and what none of them absorbs is taken from the member as the
// Share of its Max HP it is. An enemy's strike, a boar's charge and the sheer cold's damage all land this way
export const hitPartyMember = (
  party: Party,
  combatant: Combatant,
  kitEffectState: KitEffectState,
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
  damage: number,
  element?: Element,
): void => {
  const buffedCombatant = getBuffedCombatant(combatant, kitEffectState.effects, party, characterIdCombatantMap);
  const { maxHealth } = buffedCombatant.attributes;
  const overflow = absorbKitShield(kitEffectState.effects, buffedCombatant, damage, element);
  damagePartyMember(party, combatant.characterId, overflow / maxHealth, {
    element,
    fallRefusal: createKitFallRefusal(combatant, kitEffectState, maxHealth),
  });
};
