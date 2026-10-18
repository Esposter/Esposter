import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { EnemyState } from "#src/models/enemy/EnemyState";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addCrystallizeShards } from "#src/services/kit/addCrystallizeShards";
import { addDendroCores } from "#src/services/kit/addDendroCores";
import { addMoondrifts } from "#src/services/kit/addMoondrifts";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { collectKitEnergyDrops } from "#src/services/kit/collectKitEnergyDrops";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { healKitParty } from "#src/services/kit/effects/healKitParty";
import { healKitStriker } from "#src/services/kit/effects/healKitStriker";
import { strikeKitBubble } from "#src/services/kit/effects/strikeKitBubble";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { landKitReactionReaches } from "#src/services/kit/landKitReactionReaches";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { strikeKitDendroCores } from "#src/services/kit/strikeKitDendroCores";
import { addEnduringRockStatus } from "#src/services/party/addEnduringRockStatus";
import { addSprawlingGreeneryBuffs } from "#src/services/party/addSprawlingGreeneryBuffs";
import { getPartyMoonsign } from "#src/services/party/getPartyMoonsign";
import { getReactionParticleDrops } from "#src/services/party/getReactionParticleDrops";
import { startPartyLunarReactions } from "#src/services/party/startPartyLunarReactions";
import { strikeKitWildlife } from "#src/services/wildlife/strikeKitWildlife";

// A step's strikes landed on the standing enemies each reaches, its one target or every one within its area, each
// Priced by its combatant as its buffs and the kit's own DMG Bonus against that enemy raise it, its Electro or Pyro
// First setting off the Dendro Cores in its area. Its element reacts, and a direct Lunar hit is priced, as the deployed
// Team's Moonsign gives. Each enemy struck drops its energy to the team, collected by the member on the field, and the
// Strike's bubbles, heals, Crystallize shards, Moondrifts, Dendro Cores, the party's Lunar answers and reactions
// Follow, the reactions it triggered and the damage the enemy took sent to the deployed team's kits. Once the strike
// Has landed on every enemy it reaches, each reaction that landed with a reach reaches the enemies round its own, whose
// Energy and reactions follow in turn. The strikes given keep only those that struck an enemy, written in place
export const strikeKitEnemies = (strikes: KitStrike[], context: KitContext): void => {
  const {
    characterIdCombatantMap,
    enemyMap,
    enemyTables,
    kitEffectState,
    party,
    placeWildlifeDrops,
    random,
    wildlifeList,
  } = context;
  let struckCount = 0;
  const moonsign = getPartyMoonsign(characterIdCombatantMap, kitEffectState.effects, party, context.body.position);
  for (const strike of strikes) {
    const { attackTag, body, combatant, hit, target } = strike;
    const pricedCombatant = getBuffedCombatant(combatant, kitEffectState.effects, party, context.body.position);
    let isStruck = false;
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
      isStruck = true;
      addEnduringRockStatus(
        enemy,
        pricedCombatant,
        kitEffectState.effects,
        party.lunarCrystallize.moondrifts,
        context.body.position,
      );
      const damageBonus = combatant.kit.getStrikeDamageBonus?.(strike, enemy, party) ?? 0;
      const pricedHit = damageBonus === 0 ? hit : { ...hit, damageBonus: (hit.damageBonus ?? 0) + damageBonus };
      const criticalRateBonus = combatant.kit.getStrikeCriticalRateBonus?.(strike, enemy) ?? 0;
      const { energyDrops, isCritical, reachingReactions, reactions } = strikeEnemy(
        enemyTables,
        enemy,
        pricedHit,
        pricedCombatant,
        random,
        moonsign,
        criticalRateBonus,
      );
      collectKitEnergyDrops(
        [...energyDrops, ...getReactionParticleDrops(party, reactions, combatant.elementalResonances)],
        combatant.element,
        context,
      );
      addSprawlingGreeneryBuffs(kitEffectState, party, pricedCombatant, reactions);
      addCrystallizeShards(kitEffectState, enemy, pricedCombatant, reactions, random);
      addMoondrifts(party, enemy, pricedCombatant, reactions, body.position);
      addDendroCores(kitEffectState, enemy, pricedCombatant, reactions, random);
      startPartyLunarReactions(party, reactions);
      for (const reaction of reachingReactions) reaches.push([enemy, reaction]);
      strikeKitBubble(kitEffectState, enemy, pricedCombatant, hit);
      healKitStriker(context, combatant, pricedCombatant, hit);
      hit.onStrike?.(context, strike);
      if (!isPartyHealed) isPartyHealed = healKitParty(context, combatant, pricedCombatant, hit);
      if (reactions.length > 0) {
        context.reactionTriggers.push({ enemy, reactions });
        emitKitEvent({ enemy, kind: KitEventKind.ReactionTriggered, reactions, striker: combatant }, context);
      }
      const element = getKitHitElement(hit, combatant);
      if (element !== undefined)
        emitKitEvent({ element, enemy, kind: KitEventKind.ElementalHit, striker: combatant }, context);
      if (hit.weakPoint) emitKitEvent({ enemy, kind: KitEventKind.WeakPointHit, striker: combatant }, context);
      emitKitEvent(
        {
          attackTag,
          enemy,
          hit,
          isCritical,
          isDefeated: enemy.state === EnemyState.Dead,
          kind: KitEventKind.DamageTaken,
          striker: combatant,
        },
        context,
      );
      if (enemy.state === EnemyState.Dead)
        emitKitEvent({ enemy, kind: KitEventKind.EnemyDefeated, striker: combatant }, context);
    }
    if (target === undefined) strikeKitWildlife(hit.hitArea, body, wildlifeList, placeWildlifeDrops);

    landKitReactionReaches(reaches, pricedCombatant, context);
    if (isStruck) strikes[struckCount++] = strike;
  }
  strikes.length = struckCount;
};
