import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { ReactionType } from "#src/models/combat/ReactionType";
import { StellarReactionType } from "#src/models/combat/StellarReactionType";
import { Element } from "#src/models/Element";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { STELLAR_SWIRL_ANEMO_COEFFICIENT } from "#src/services/combat/damage/constants";
import { checkHasEnemyWeakPoints } from "#src/services/enemy/checkHasEnemyWeakPoints";
import { addCrystallizeShards } from "#src/services/kit/addCrystallizeShards";
import { addDendroCores } from "#src/services/kit/addDendroCores";
import { addMoondrifts } from "#src/services/kit/addMoondrifts";
import { addPolestarField } from "#src/services/kit/addPolestarField";
import { checkIsInAttackArea } from "#src/services/kit/checkIsInAttackArea";
import { checkIsInKitHitbox } from "#src/services/kit/checkIsInKitHitbox";
import { collectKitEnergyDrops } from "#src/services/kit/collectKitEnergyDrops";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getElementCriticalDamageBonus } from "#src/services/kit/effects/getElementCriticalDamageBonus";
import { healKitParty } from "#src/services/kit/effects/healKitParty";
import { healKitStriker } from "#src/services/kit/effects/healKitStriker";
import { strikeKitBubble } from "#src/services/kit/effects/strikeKitBubble";
import { emitKitEnemyDefeated } from "#src/services/kit/emitKitEnemyDefeated";
import { emitKitEvent } from "#src/services/kit/emitKitEvent";
import { getDeployedStrikeBonuses } from "#src/services/kit/getDeployedStrikeBonuses";
import { getKitHitElement } from "#src/services/kit/getKitHitElement";
import { landKitReactionReaches } from "#src/services/kit/landKitReactionReaches";
import { selectKitHitTarget } from "#src/services/kit/selectKitHitTarget";
import { strikeEnemy } from "#src/services/kit/strikeEnemy";
import { strikeKitDendroCores } from "#src/services/kit/strikeKitDendroCores";
import { strikeStellarReaction } from "#src/services/kit/strikeStellarReaction";
import { addEnduringRockStatus } from "#src/services/party/addEnduringRockStatus";
import { addSprawlingGreeneryBuffs } from "#src/services/party/addSprawlingGreeneryBuffs";
import { getDeployedCombatants } from "#src/services/party/getDeployedCombatants";
import { getPartyMoonsign } from "#src/services/party/getPartyMoonsign";
import { getPartyStellarReactionTypes } from "#src/services/party/getPartyStellarReactionTypes";
import { getReactionParticleDrops } from "#src/services/party/getReactionParticleDrops";
import { startPartyLunarReactions } from "#src/services/party/startPartyLunarReactions";
import { strikeKitWildlife } from "#src/services/wildlife/strikeKitWildlife";

// Whether a strike's reach misses an enemy: its target's hitbox, its target alone, or else its hit's area about the body
const checkIsOutOfStrikeReach = ({ body, hit, hitbox, target }: KitStrike, enemy: Enemy): boolean => {
  if (target === undefined) return !checkIsInAttackArea(hit.hitArea, body, enemy);
  if (hitbox === undefined) return target !== enemy;
  return !checkIsInKitHitbox(hitbox, target.position, enemy.position);
};

// A step's strikes landed on the standing enemies each reaches, its one target or every one within its area, each
// Priced by its combatant as its buffs, the kit's own DMG Bonus and the deployed team's party strike bonuses raise it
// Against that enemy, its Electro or Pyro First setting off the Dendro Cores in its area. Its element reacts, and a
// Direct Lunar hit is priced as the deployed team's Moonsign gives. Each enemy struck drops its energy to the team,
// Collected by the member on the field, and the strike's bubbles, heals, Crystallize shards, Moondrifts, Dendro Cores,
// The party's Lunar answers and reactions follow, the reactions it triggered and the damage the enemy took sent to the
// Deployed team's kits. Once the strike has landed on every enemy it reaches, each reaction that landed with a reach
// Reaches the enemies round its own, whose energy and reactions follow in turn. The strikes given keep only those that
// Struck an enemy, written in place
export const strikeKitEnemies = (strikes: KitStrike[], context: KitContext): void => {
  const { characterIdCombatantMap, enemyMap, kitEffectState, party, placeWildlifeDrops, random, wildlifeList } =
    context;
  let struckCount = 0;
  const moonsign = getPartyMoonsign(characterIdCombatantMap, kitEffectState.effects, party, context.body.position);
  const stellarReactionTypes = getPartyStellarReactionTypes(characterIdCombatantMap, party);
  for (const strike of strikes) {
    const { attackTag, body, combatant, hit, isGadget } = strike;
    const target = strike.target ?? selectKitHitTarget(hit, body, enemyMap.values());
    const targetedStrike: KitStrike = { ...strike, target };
    const pricedCombatant = getBuffedCombatant(
      combatant,
      kitEffectState.effects,
      party,
      characterIdCombatantMap,
      context.body.position,
    );
    const deployedCombatants = getDeployedCombatants(party, characterIdCombatantMap);
    let isStruck = false;
    // A hit's party heal rolls on each enemy it strikes until one roll passes
    let isPartyHealed = false;
    // The reactions that landed with a reach, each with the enemy it landed on, reached once the strike has landed
    const reaches: [Enemy, TransformativeReaction][] = [];
    strikeKitDendroCores(kitEffectState, party, targetedStrike, pricedCombatant);
    for (const enemy of enemyMap.values()) {
      if ([EnemyState.Dead, EnemyState.Return].includes(enemy.state) || checkIsOutOfStrikeReach(targetedStrike, enemy))
        continue;
      // The first enemy the strike lands on takes the flag an effect given once per attack reads
      const isFirstEnemyStruck = !isStruck;
      isStruck = true;
      addEnduringRockStatus(
        enemy,
        pricedCombatant,
        kitEffectState.effects,
        party.lunarCrystallize.moondrifts,
        context.body.position,
      );
      // An aimed hit takes the weak point of an enemy that has one: the aim's point is not modelled, so every aimed hit does
      const enemyHit = strike.isAimed && checkHasEnemyWeakPoints(enemy) ? { ...hit, weakPoint: true } : hit;
      // The kit's per-strike hooks read the striker as it is priced, with the buffs on it
      const pricedStrike = { ...targetedStrike, combatant: pricedCombatant, hit: enemyHit };
      const deployedBonuses = getDeployedStrikeBonuses(
        pricedStrike,
        deployedCombatants,
        enemy,
        party,
        kitEffectState.effects,
        characterIdCombatantMap,
      );
      const { additiveBaseDamageBonus } = enemyHit;
      const flatDamage =
        (combatant.kit.getStrikeAdditiveBaseDamageBonus?.(
          pricedStrike,
          enemy,
          party,
          kitEffectState.effects,
          characterIdCombatantMap,
        ) ?? 0) + deployedBonuses.additiveBaseDamageBonus;
      const pricedHit = {
        ...enemyHit,
        additiveBaseDamageBonus: (striker: Combatant) => (additiveBaseDamageBonus?.(striker) ?? 0) + flatDamage,
        // The strike's attack tag, which a summon's hits leave untagged, falls back to the hit's own
        attackTag: attackTag ?? enemyHit.attackTag,
        criticalDamageBonus:
          (enemyHit.criticalDamageBonus ?? 0) +
          getElementCriticalDamageBonus(
            kitEffectState.effects,
            combatant.characterId,
            getKitHitElement(enemyHit, combatant),
          ) +
          (combatant.kit.getStrikeCriticalDamageBonus?.(pricedStrike, enemy, party, kitEffectState.effects) ?? 0) +
          deployedBonuses.criticalDamageBonus,
        criticalRateBonus:
          (enemyHit.criticalRateBonus ?? 0) +
          (combatant.kit.getStrikeCriticalRateBonus?.(pricedStrike, enemy, party, kitEffectState.effects) ?? 0) +
          deployedBonuses.criticalRateBonus,
        damageBonus:
          (enemyHit.damageBonus ?? 0) +
          (combatant.kit.getStrikeDamageBonus?.(pricedStrike, enemy, party, kitEffectState.effects) ?? 0) +
          deployedBonuses.damageBonus,
        defenseIgnored:
          (enemyHit.defenseIgnored ?? 0) +
          (combatant.kit.getStrikeDefenceIgnored?.(pricedStrike, enemy, party, kitEffectState.effects) ?? 0) +
          deployedBonuses.defenseIgnored,
      };
      const { appliedElement, energyDrops, isCritical, reachingReactions, reactions } = strikeEnemy(
        enemy,
        pricedHit,
        pricedCombatant,
        context,
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
      const enemyStrike: KitStrike = isFirstEnemyStruck
        ? { ...targetedStrike, isFirstEnemyStruck: true }
        : targetedStrike;
      enemyHit.onStrike?.(context, enemyStrike, enemy);
      if (!isPartyHealed) isPartyHealed = healKitParty(context, combatant, pricedCombatant, enemyHit);
      addPolestarField(kitEffectState, combatant.characterId, reactions, body.position);
      // The defeat the strike dealt is reported here, and a Stellar reaction's defeat by the damage point it deals
      const isDefeatedByStrike = enemy.state === EnemyState.Dead;
      if (reactions.some(({ reactionType }) => reactionType === ReactionType.StellarSwirl))
        strikeStellarReaction(
          enemy,
          Element.Anemo,
          STELLAR_SWIRL_ANEMO_COEFFICIENT,
          new Set([combatant.characterId]),
          combatant,
          context,
          StellarReactionType.StellarSwirl,
        );
      if (reactions.length > 0) {
        context.reactionTriggers.push({ enemy, reactions });
        emitKitEvent(
          {
            attackTag,
            enemy,
            kind: KitEventKind.ReactionTriggered,
            reactions,
            striker: combatant,
            ...(isGadget ? { isGadget } : {}),
          },
          context,
        );
      }
      const element = getKitHitElement(enemyHit, combatant);
      emitKitEvent({ attackTag, element, enemy, kind: KitEventKind.EnemyHit, striker: combatant }, context);
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
      if (isDefeatedByStrike) emitKitEnemyDefeated(enemy, combatant, context);
    }
    if (target === undefined && hit.targetIndex === undefined)
      for (const wildlife of strikeKitWildlife(hit.hitArea, body, wildlifeList, placeWildlifeDrops))
        emitKitEvent({ kind: KitEventKind.WildlifeStruck, striker: combatant, wildlife }, context);

    landKitReactionReaches(reaches, pricedCombatant, context);
    if (isStruck) strikes[struckCount++] = strike;
  }
  strikes.length = struckCount;
};
