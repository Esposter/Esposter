import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitStrike } from "#src/models/kit/KitStrike";
import type { KitStrikeContext } from "#src/models/kit/KitStrikeContext";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addCrystallizeShards } from "#src/services/kit/addCrystallizeShards";
import { addDendroCores } from "#src/services/kit/addDendroCores";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { healKitParty } from "#src/services/kit/effects/healKitParty";
import { healKitStriker } from "#src/services/kit/effects/healKitStriker";
import { strikeKitBubble } from "#src/services/kit/effects/strikeKitBubble";
import { landKitReactionReaches } from "#src/services/kit/landKitReactionReaches";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { strikeKitDendroCores } from "#src/services/kit/strikeKitDendroCores";
import { addEnduringRockStatus } from "#src/services/party/addEnduringRockStatus";
import { addSprawlingGreeneryBuffs } from "#src/services/party/addSprawlingGreeneryBuffs";
import { gainPartyEnergy } from "#src/services/party/gainPartyEnergy";

// A step's strikes landed on the standing enemies each reaches, its one target or every one within its area, each priced
// By its combatant as its buffs and the kit's own DMG Bonus against that enemy raise it, its Electro or Pyro first
// Setting off the Dendro Cores in its area. Each enemy struck drops its energy to the team, and the strike's bubbles,
// Heals, Crystallize shards, Dendro Cores and reactions follow, the reactions it triggered and the damage the enemy took
// Sent to the deployed team's kits. Once the strike has landed on every enemy it reaches, each reaction that landed with
// A reach reaches the enemies round its own, whose energy and reactions follow in turn. It returns the strikes that
// Struck an enemy
export const strikeKitEnemies = (strikes: readonly KitStrike[], context: KitStrikeContext): KitStrike[] => {
  const { characterIdCombatantMap, emit, enemyMap, enemyTables, kitEffectState, party, random } = context;
  const struckStrikes: KitStrike[] = [];
  for (const strike of strikes) {
    const { attackTag, body, combatant, hit, target } = strike;
    const pricedCombatant = getBuffedCombatant(combatant, kitEffectState.effects);
    // A hit's party heal rolls on each enemy it strikes until one roll passes
    let isPartyHealed = false;
    // The reactions that landed with a reach, each with the enemy it landed on, reached once the strike has landed
    const reaches: [Enemy, TransformativeReaction][] = [];
    strikeKitDendroCores(kitEffectState, party, strike, pricedCombatant);
    for (const enemy of enemyMap.values()) {
      if (
        [EnemyState.Dead, EnemyState.Return].includes(enemy.state) ||
        (target ? target !== enemy : !checkIsInAttackArea(hit.hitArea, body, enemy))
      )
        continue;
      if (struckStrikes.at(-1) !== strike) struckStrikes.push(strike);
      addEnduringRockStatus(enemy, pricedCombatant, kitEffectState.effects);
      const damageBonus = combatant.kit.getStrikeDamageBonus?.(strike, enemy, party) ?? 0;
      const pricedHit = damageBonus === 0 ? hit : { ...hit, damageBonus: (hit.damageBonus ?? 0) + damageBonus };
      const { energyDrops, isCritical, reachingReactions, reactions } = strikeEnemy(
        enemyTables,
        enemy,
        pricedHit,
        pricedCombatant,
        random,
      );
      for (const energyDrop of energyDrops)
        gainPartyEnergy(party, energyDrop, combatant.element, characterIdCombatantMap);
      addSprawlingGreeneryBuffs(kitEffectState, party, pricedCombatant, reactions);
      addCrystallizeShards(kitEffectState, enemy, pricedCombatant, reactions, random);
      addDendroCores(kitEffectState, enemy, pricedCombatant, reactions, random);
      for (const reaction of reachingReactions) reaches.push([enemy, reaction]);
      strikeKitBubble(kitEffectState, enemy, pricedCombatant, hit);
      healKitStriker(party, pricedCombatant, hit);
      hit.onStrike?.({ body, combatant, kitEffectState, party });
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

    landKitReactionReaches(reaches, pricedCombatant, context);
  }
  return struckStrikes;
};
