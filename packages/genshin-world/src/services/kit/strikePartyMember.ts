import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitPartyMemberStruckEvent } from "#src/models/kit/KitPartyMemberStruckEvent";
import type { KitShieldAbsorbedEvent } from "#src/models/kit/KitShieldAbsorbedEvent";
import type { Party } from "#src/models/party/Party";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { computeEnemyStrikeDamage } from "#src/services/kit/computeEnemyStrikeDamage";
import { ENEMY_STRIKE_GAUGE } from "#src/services/kit/constants";
import { checkIsKitShieldLive } from "#src/services/kit/effects/checkIsKitShieldLive";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { hitPartyMember } from "#src/services/kit/hitPartyMember";
import { applyPartyMemberElement } from "#src/services/party/applyPartyMemberElement";

// An enemy's strike on a party member: its damage, priced against the member as the team's buffs leave it, is first
// Taken by the team's shields, and what none of them absorbs is taken from the member as the share of its Max HP it is,
// Then the kind's attack element, if it has one, is applied to it.
// Each shield that took any of it is returned for its owner, as the damage it took, the health it has left and the
// Member the strike was on, and then the strike itself, the enemy that struck, the member it landed on and whether a
// Shield took any of it, which a strike a shield absorbed whole is told by as well
export const strikePartyMember = (
  enemyTables: EnemyTables,
  party: Party,
  enemy: Enemy,
  combatant: Combatant,
  kitEffectState: KitEffectState,
  characterIdCombatantMap: ReadonlyMap<number, Combatant>,
): (KitPartyMemberStruckEvent | KitShieldAbsorbedEvent)[] => {
  const shields = kitEffectState.effects.filter((effect) => checkIsKitShieldLive(effect));
  const healthsBefore = shields.map((shield) => ({ before: shield.health, shield }));
  const { attackElement } = enemy.traits;
  hitPartyMember(
    party,
    combatant,
    kitEffectState,
    characterIdCombatantMap,
    computeEnemyStrikeDamage(
      enemyTables,
      enemy,
      getBuffedCombatant(combatant, kitEffectState.effects, party, characterIdCombatantMap),
    ),
    attackElement,
  );
  if (attackElement !== undefined)
    applyPartyMemberElement(
      party,
      combatant.characterId,
      attackElement,
      ENEMY_STRIKE_GAUGE,
      combatant.elementalResonances,
    );
  const shieldAbsorbedEvents = healthsBefore
    .map(({ before, shield }): KitShieldAbsorbedEvent => ({
      amount: before - shield.health,
      characterId: shield.characterId,
      health: shield.health,
      kind: KitEventKind.ShieldAbsorbed,
      struckCharacterId: combatant.characterId,
    }))
    .filter(({ amount }) => amount > 0);
  return [
    ...shieldAbsorbedEvents,
    {
      isShielded: shieldAbsorbedEvents.length > 0,
      kind: KitEventKind.PartyMemberStruck,
      striker: enemy,
      struckCharacterId: combatant.characterId,
    },
  ];
};
