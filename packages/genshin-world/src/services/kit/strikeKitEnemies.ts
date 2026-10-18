import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { ReactionType } from "#src/models/combat/ReactionType";
import { Element } from "#src/models/Element";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { STELLAR_SWIRL_ANEMO_COEFFICIENT } from "#src/services/combat/damage/constants";
import { hasEnemyWeakPoints } from "#src/services/enemy/hasEnemyWeakPoints";
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
import { strikeStellarReaction } from "#src/services/kit/strikeStellarReaction";
import { addEnduringRockStatus } from "#src/services/party/addEnduringRockStatus";
import { addPolestarField } from "#src/services/kit/addPolestarField";
import { addSprawlingGreeneryBuffs } from "#src/services/party/addSprawlingGreeneryBuffs";
import { getPartyMoonsign } from "#src/services/party/getPartyMoonsign";
import { getPartyStellarReactionTypes } from "#src/services/party/getPartyStellarReactionTypes";
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
  const stellarReactionTypes = getPartyStellarReactionTypes(characterIdCombatantMap, party);
  for (const strike of strikes) {
    const { attackTag, body, combatant, hit, target } = strike;
    const pricedCombatant = getBuffedCombatant(
      combatant,
      kitEffectState.effects,
      party,
      characterIdCombatantMap,
      context.body.position,
    );
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
      // An aimed hit takes the weak point of an enemy that has one: the aim's point is not modelled, so every aimed hit does
      const enemyHit = strike.isAimed && hasEnemyWeakPoints(enemy) ? { ...hit, weakPoint: true } : hit;
      const pricedStrike = { ...strike, combatant: pricedCombatant, hit: enemyHit };
      const { additiveBaseDamageBonus } = enemyHit;
      const flatDamage =
        combatant.kit.getStrikeAdditiveBaseDamageBonus?.(pricedStrike, enemy, party, kitEffectState.effects) ?? 0;
      const pricedHit = {
        ...enemyHit,
        additiveBaseDamageBonus: (striker: Combatant) => (additiveBaseDamageBonus?.(striker) ?? 0) + flatDamage,
        criticalRateBonus:
          (enemyHit.criticalRateBonus ?? 0) +
          (combatant.kit.getStrikeCriticalRateBonus?.(pricedStrike, enemy, party, kitEffectState.effects) ?? 0),
        damageBonus:
          (enemyHit.damageBonus ?? 0) +
          (combatant.kit.getStrikeDamageBonus?.(pricedStrike, enemy, party, kitEffectState.effects) ?? 0),
      };
      const { appliedElement, energyDrops, isCritical, reachingReactions, reactions } = strikeEnemy(
        enemyTables,
        enemy,
        pricedHit,
        pricedCombatant,
        random,
        moonsign,
        stellarReactionTypes,
      );
      if (appliedElement !== undefined)
        emitKitEvent(
          { element: appliedElement, enemy, kind: KitEventKind.ElementApplied, striker: combatant },
          context,
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
      strikeKitBubble(kitEffectState, enemy, pricedCombatant, enemyHit);
      healKitStriker(context, combatant, pricedCombatant, enemyHit);
      enemyHit.onStrike?.(context, strike);
      if (!isPartyHealed) isPartyHealed = healKitParty(context, combatant, pricedCombatant, enemyHit);
      addPolestarField(kitEffectState, combatant.characterId, reactions, body.position);
      if (reactions.some(({ reactionType }) => reactionType === ReactionType.StellarSwirl))
        strikeStellarReaction(
          enemy,
          Element.Anemo,
          STELLAR_SWIRL_ANEMO_COEFFICIENT,
          new Set([combatant.characterId]),
          combatant,
          context,
        );
      if (reactions.length > 0) {
        context.reactionTriggers.push({ enemy, reactions });
        emitKitEvent({ enemy, kind: KitEventKind.ReactionTriggered, reactions, striker: combatant }, context);
      }
      const element = getKitHitElement(enemyHit, combatant);
      if (element !== undefined)
        emitKitEvent({ element, enemy, kind: KitEventKind.ElementalHit, striker: combatant }, context);
      if (enemyHit.weakPoint) emitKitEvent({ enemy, kind: KitEventKind.WeakPointHit, striker: combatant }, context);
      emitKitEvent(
        {
          attackTag,
          enemy,
          hit: enemyHit,
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
    if (target === undefined)
      for (const wildlife of strikeKitWildlife(hit.hitArea, body, wildlifeList, placeWildlifeDrops))
        emitKitEvent({ kind: KitEventKind.WildlifeStruck, striker: combatant, wildlife }, context);

    landKitReactionReaches(reaches, pricedCombatant, context);
    if (isStruck) strikes[struckCount++] = strike;
  }
  strikes.length = struckCount;
};
