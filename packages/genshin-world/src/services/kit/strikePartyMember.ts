import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { computeEnemyStrikeDamage } from "#src/services/kit/computeEnemyStrikeDamage";
import { absorbKitShield } from "#src/services/kit/effects/absorbKitShield";
import { damagePartyMember } from "#src/services/party/damagePartyMember";

// An enemy's strike on a party member: its damage is first taken by the team's shields, and what none of them absorbs is
// Taken from the member as the share of its Max HP it is
export const strikePartyMember = (
  party: Party,
  enemy: Enemy,
  combatant: Combatant,
  kitEffectState: KitEffectState,
): void => {
  const overflow = absorbKitShield(kitEffectState.effects, combatant, computeEnemyStrikeDamage(enemy, combatant));
  damagePartyMember(party, combatant.characterId, overflow / combatant.attributes.maxHealth);
};
