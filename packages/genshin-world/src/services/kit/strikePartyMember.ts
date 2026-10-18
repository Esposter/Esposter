import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { Party } from "#src/models/party/Party";

import { computeEnemyStrikeDamage } from "#src/services/kit/computeEnemyStrikeDamage";
import { ENEMY_STRIKE_GAUGE } from "#src/services/kit/constants";
import { absorbKitShield } from "#src/services/kit/effects/absorbKitShield";
import { applyPartyMemberElement } from "#src/services/party/applyPartyMemberElement";
import { damagePartyMember } from "#src/services/party/damagePartyMember";

// An enemy's strike on a party member: its damage is first taken by the team's shields, and what none of them absorbs is
// Taken from the member as the share of its Max HP it is, then the kind's attack element, if it has one, is applied to it
export const strikePartyMember = (
  enemyTables: EnemyTables,
  party: Party,
  enemy: Enemy,
  combatant: Combatant,
  kitEffectState: KitEffectState,
): void => {
  const overflow = absorbKitShield(
    kitEffectState.effects,
    combatant,
    computeEnemyStrikeDamage(enemyTables, enemy, combatant),
  );
  damagePartyMember(party, combatant.characterId, overflow / combatant.attributes.maxHealth);
  const { attackElement } = enemy.traits;
  if (attackElement !== undefined)
    applyPartyMemberElement(
      party,
      combatant.characterId,
      attackElement,
      ENEMY_STRIKE_GAUGE,
      combatant.elementalResonances,
    );
};
