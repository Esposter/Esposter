import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitShieldAbsorbedEvent } from "#src/models/kit/KitShieldAbsorbedEvent";
import type { Party } from "#src/models/party/Party";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeEnemyStrikeDamage } from "#src/services/kit/computeEnemyStrikeDamage";
import { ENEMY_STRIKE_GAUGE } from "#src/services/kit/constants";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";
import { hitPartyMember } from "#src/services/kit/hitPartyMember";
import { applyPartyMemberElement } from "#src/services/party/applyPartyMemberElement";

// An enemy's strike on a party member: its damage is first taken by the team's shields, and what none of them absorbs is
// Taken from the member as the share of its Max HP it is, then the kind's attack element, if it has one, is applied to it.
// Each shield that took any of it is returned for its owner, as the damage it took and the member the strike was on
export const strikePartyMember = (
  enemyTables: EnemyTables,
  party: Party,
  enemy: Enemy,
  combatant: Combatant,
  kitEffectState: KitEffectState,
): KitShieldAbsorbedEvent[] => {
  const shields = kitEffectState.effects.filter((effect) => checkIsKitShieldLive(effect));
  const healths = shields.map((shield) => shield.health);
  hitPartyMember(party, combatant, kitEffectState, computeEnemyStrikeDamage(enemyTables, enemy, combatant));
  const { attackElement } = enemy.traits;
  if (attackElement !== undefined)
    applyPartyMemberElement(
      party,
      combatant.characterId,
      attackElement,
      ENEMY_STRIKE_GAUGE,
      combatant.elementalResonances,
    );
  return shields
    .map((shield, index): KitShieldAbsorbedEvent => ({
      amount: healths[index] - shield.health,
      characterId: shield.characterId,
      kind: KitEventKind.ShieldAbsorbed,
      struckCharacterId: combatant.characterId,
    }))
    .filter(({ amount }) => amount > 0);
};
