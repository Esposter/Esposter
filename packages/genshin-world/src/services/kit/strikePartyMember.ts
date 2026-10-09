import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffect } from "#src/models/kit/KitEffect";
import type { Party } from "#src/models/party/Party";

import { computeEnemyStrikeDamage } from "#src/services/kit/computeEnemyStrikeDamage";
import { absorbKitShield } from "#src/services/kit/effects/absorbKitShield";
import { damagePartyMember } from "#src/services/party/damagePartyMember";

// An enemy's strike on a party member: its damage is first taken by the member's shield, and what the shield does not
// Absorb is taken from the member as the share of its Max HP it is
export const strikePartyMember = (party: Party, enemy: Enemy, combatant: Combatant, effects: KitEffect[]): void => {
  const overflow = absorbKitShield(effects, combatant, computeEnemyStrikeDamage(enemy, combatant));
  damagePartyMember(party, combatant.characterId, overflow / combatant.attributes.maxHealth);
};
