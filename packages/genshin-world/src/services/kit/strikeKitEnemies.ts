import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitEffectState } from "#src/models/kit/KitEffectState";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { Party } from "#src/models/party/Party";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { healKitParty } from "#src/services/kit/effects/healKitParty";
import { healKitStriker } from "#src/services/kit/effects/healKitStriker";
import { strikeKitBubble } from "#src/services/kit/effects/strikeKitBubble";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { addEnduringRockStatus } from "#src/services/party/addEnduringRockStatus";
import { addSprawlingGreeneryBuffs } from "#src/services/party/addSprawlingGreeneryBuffs";
import { gainPartyEnergy } from "#src/services/party/gainPartyEnergy";

// A step's strikes landed on the standing enemies each reaches, its one target or every one within its area, each priced
// By its combatant as its buffs and the kit's own DMG Bonus against that enemy raise it. Each enemy struck drops its
// Energy to the team, and the strike's bubbles, heals and reactions follow, the reactions it triggered and the damage
// The enemy took sent to the deployed team's kits
export const strikeKitEnemies = (
  strikes: readonly KitStrike[],
  context: {
    characterIdCombatantMap: Map<number, Combatant>;
    emit: (event: KitEvent) => void;
    enemyMap: Map<string, Enemy>;
    enemyTables: EnemyTables;
    kitEffectState: KitEffectState;
    party: Party;
    random: () => number;
  },
): void => {
  const { characterIdCombatantMap, emit, enemyMap, enemyTables, kitEffectState, party, random } = context;
  for (const strike of strikes) {
    const { attackTag, body, combatant, hit, target } = strike;
    const pricedCombatant = getBuffedCombatant(combatant, kitEffectState.effects);
    // A hit's party heal rolls on each enemy it strikes until one roll passes
    let isPartyHealed = false;
    for (const enemy of enemyMap.values()) {
      if (
        [EnemyState.Dead, EnemyState.Return].includes(enemy.state) ||
        (target ? target !== enemy : !checkIsInAttackArea(hit.hitArea, body, enemy))
      )
        continue;
      addEnduringRockStatus(enemy, pricedCombatant, kitEffectState.effects);
      const damageBonus = combatant.kit.getStrikeDamageBonus?.(strike, enemy, party) ?? 0;
      const pricedHit = damageBonus === 0 ? hit : { ...hit, damageBonus: (hit.damageBonus ?? 0) + damageBonus };
      const { energyDrops, isCritical, reactions } = strikeEnemy(
        enemyTables,
        enemy,
        pricedHit,
        pricedCombatant,
        random,
      );
      for (const energyDrop of energyDrops)
        gainPartyEnergy(party, energyDrop, combatant.element, characterIdCombatantMap);
      addSprawlingGreeneryBuffs(kitEffectState, party, pricedCombatant, reactions);
      strikeKitBubble(kitEffectState, enemy, pricedCombatant, hit);
      healKitStriker(party, pricedCombatant, hit);
      hit.onStrike?.({ body, combatant, kitEffectState });
      if (!isPartyHealed)
        isPartyHealed = healKitParty(
          party,
          characterIdCombatantMap,
          kitEffectState.effects,
          pricedCombatant,
          hit,
          random,
        );
      if (reactions.length > 0) emit({ enemy, kind: KitEventKind.ReactionTriggered, reactions, striker: combatant });
      emit({
        attackTag,
        enemy,
        hit,
        isCritical,
        isDefeated: enemy.state === EnemyState.Dead,
        kind: KitEventKind.DamageTaken,
        striker: combatant,
      });
    }
  }
};
