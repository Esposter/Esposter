import type { LunarReactionType } from "#src/models/combat/LunarReactionType";
import type { StellarReactionType } from "#src/models/combat/StellarReactionType";
import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { Combatant } from "#src/models/kit/Combatant";
import type { EnemyStrikeResult } from "#src/models/kit/EnemyStrikeResult";

import { Attribute } from "#src/models/character/Attribute";
import { AuraType } from "#src/models/combat/AuraType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { applyBluntHit } from "#src/services/combat/aura/applyBluntHit";
import { applyBurningInternalCooldown } from "#src/services/combat/aura/applyBurningInternalCooldown";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { TransformativeReactionPoiseDamageMap } from "#src/services/combat/damage/TransformativeReactionPoiseDamageMap";
import { applyReactionInternalCooldown } from "#src/services/combat/internalCooldown/applyReactionInternalCooldown";
import { TransformativeReactionReachRadiusMap } from "#src/services/combat/reach/TransformativeReactionReachRadiusMap";
import { addSuperconductStatus } from "#src/services/enemy/addSuperconductStatus";
import { ENEMY_CAPSULE_RADIUS } from "#src/services/enemy/constants";
import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { applyEnemyElement } from "#src/services/kit/applyEnemyElement";
import { priceEnemyReactions } from "#src/services/kit/priceEnemyReactions";

// A reaction that landed on an enemy, or burst from a Dendro Core, reaching every other standing enemy within its radius
// Of it, written into each in place and priced from the combatant that triggered it. An Overloaded's or a Superconduct's
// Explosion deals each its damage, and a Superconduct's takes each one's Physical RES down. An Overloaded's is a blunt
// Hit of its poise too, which drains a Freeze and shatters what is left. A Swirl applies its element
// To each at the gauge it spreads, and every Swirl but a Hydro one deals each its damage, which what its element
// Triggers there amplifies or adds to, as the reactions it triggers deal their own. A Burning tick applies its Pyro to
// Each under that enemy's own Burning internal cooldown and deals each its damage. Electro-Charged arcs to the nearest
// Wet enemy alone, dealing it its damage and applying nothing, and a Dendro Core's burst, Burgeon and Hyperbloom deal
// Each theirs. The damage on each is limited by the source's internal cooldown there. What an element applied there
// Triggers reacts as the party's Moonsign turns it Lunar. It returns what each enemy reached took, the reactions it
// Triggered there reaching further in turn
export const landReactionReach = (
  { enemyKindMap }: EnemyTables,
  origin: Pick<Enemy, "position">,
  enemies: Iterable<Enemy>,
  { element, reactionType, spreadGauge }: TransformativeReaction,
  combatant: Combatant,
  lunarReactionTypes: readonly LunarReactionType[] = [],
  stellarReactionTypes: readonly StellarReactionType[] = [],
): Map<Enemy, EnemyStrikeResult> => {
  const enemyStrikeResultMap = new Map<Enemy, EnemyStrikeResult>();
  const radius = TransformativeReactionReachRadiusMap[reactionType];
  if (radius === undefined) return enemyStrikeResultMap;
  const reachPoiseDamage = TransformativeReactionPoiseDamageMap[reactionType] ?? 0;

  const { characterId, level } = combatant;
  const elementalMastery = combatant.attributes.attributeTotalMap[Attribute.ElementalMastery];
  // Electro-Charged arcs to the one nearest Wet enemy within its reach, and every other reaction reaches them all
  const reachedEnemies = Array.from(enemies, (enemy) => ({
    distance: Math.hypot(enemy.position.x - origin.position.x, enemy.position.z - origin.position.z),
    enemy,
  }))
    .filter(
      ({ distance, enemy }) =>
        enemy !== origin &&
        ![EnemyState.Dead, EnemyState.Return].includes(enemy.state) &&
        distance <= radius + ENEMY_CAPSULE_RADIUS &&
        (reactionType !== TransformativeReactionType.ElectroCharged || enemy.elementalState.auras.has(AuraType.Hydro)),
    )
    .toSorted((firstReachedEnemy, secondReachedEnemy) => firstReachedEnemy.distance - secondReachedEnemy.distance)
    .slice(0, reactionType === TransformativeReactionType.ElectroCharged ? 1 : undefined);
  for (const { enemy } of reachedEnemies) {
    const { elementalState, internalCooldownMap } = enemy;
    const gauge =
      reactionType === TransformativeReactionType.Burning ? applyBurningInternalCooldown(elementalState) : spreadGauge;
    const reactions = reachPoiseDamage > 0 ? applyBluntHit(elementalState, reachPoiseDamage) : [];
    if (element !== undefined && gauge !== undefined)
      reactions.push(...applyEnemyElement(enemy, element, gauge, combatant, lunarReactionTypes, stellarReactionTypes));
    if (reactionType === TransformativeReactionType.Superconduct) addSuperconductStatus(enemy);
    const kind = getEnemyKind(enemyKindMap, enemy.enemyKindId);
    const { additiveBaseDamageBonus, amplifyingMultiplier, poiseDamage, reachingReactions, transformativeDamage } =
      priceEnemyReactions(kind, enemy, reactions, combatant, element);
    const resistance = getEnemyResistance(kind, enemy, element);
    const reactionDamage =
      reactionType === TransformativeReactionType.Swirl && element === Element.Hydro
        ? 0
        : applyReactionInternalCooldown(
            internalCooldownMap,
            characterId,
            reactionType,
            element,
            elementalState.seconds,
          ) *
          (getTransformativeDamage(reactionType, level, elementalMastery, resistance) +
            additiveBaseDamageBonus * getResistanceMultiplier(resistance)) *
          amplifyingMultiplier;
    enemyStrikeResultMap.set(enemy, {
      energyDrops: damageEnemy(enemy, {
        damage: reactionDamage + transformativeDamage,
        element,
        poiseDamage: reachPoiseDamage + poiseDamage,
      }),
      isCritical: false,
      reachingReactions,
      reactions,
    });
  }
  return enemyStrikeResultMap;
};
