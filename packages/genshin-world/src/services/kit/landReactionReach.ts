import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyTables } from "#src/models/enemy/EnemyTables";
import type { Combatant } from "#src/models/kit/Combatant";
import type { EnemyStrikeResult } from "#src/models/kit/EnemyStrikeResult";

import { Attribute } from "#src/models/character/Attribute";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { getResistanceMultiplier } from "#src/services/combat/damage/getResistanceMultiplier";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { applyReactionInternalCooldown } from "#src/services/combat/internalCooldown/applyReactionInternalCooldown";
import { TransformativeReactionReachRadiusMap } from "#src/services/combat/reach/TransformativeReactionReachRadiusMap";
import { addSuperconductStatus } from "#src/services/enemy/addSuperconductStatus";
import { ENEMY_CAPSULE_RADIUS } from "#src/services/enemy/constants";
import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { priceEnemyReactions } from "#src/services/kit/priceEnemyReactions";

// A reaction that landed on an enemy reaching every other standing enemy within its radius of it, written into each in
// Place and priced from the combatant that triggered it. An Overloaded's or a Superconduct's explosion deals each its
// Damage, and a Superconduct's takes each one's Physical RES down. A Swirl applies its element to each at the gauge it
// Spreads, and every Swirl but a Hydro one deals each its damage, which what its element triggers there amplifies or
// Adds to, as the reactions it triggers deal their own. The damage on each is limited by the source's internal cooldown
// There. It returns what each enemy reached took, a Swirl's reactions there reaching further in turn
export const landReactionReach = (
  { enemyKindMap }: EnemyTables,
  origin: Enemy,
  enemies: Iterable<Enemy>,
  { element, reactionType, spreadGauge }: TransformativeReaction,
  combatant: Combatant,
): Map<Enemy, EnemyStrikeResult> => {
  const enemyStrikeResultMap = new Map<Enemy, EnemyStrikeResult>();
  const radius = TransformativeReactionReachRadiusMap[reactionType];
  if (radius === undefined) return enemyStrikeResultMap;

  const { characterId, level } = combatant;
  const elementalMastery = combatant.attributes.attributeTotalMap[Attribute.ElementalMastery];
  for (const enemy of enemies) {
    if (
      enemy === origin ||
      [EnemyState.Dead, EnemyState.Return].includes(enemy.state) ||
      Math.hypot(enemy.position.x - origin.position.x, enemy.position.z - origin.position.z) >
        radius + ENEMY_CAPSULE_RADIUS
    )
      continue;
    const { elementalState, internalCooldownMap } = enemy;
    const reactions =
      element === undefined || spreadGauge === undefined ? [] : applyElement(elementalState, element, spreadGauge);
    if (reactionType === TransformativeReactionType.Superconduct) addSuperconductStatus(enemy);
    const kind = getEnemyKind(enemyKindMap, enemy.enemyKindId);
    const { additiveBaseDamageBonus, amplifyingMultiplier, reachingReactions, transformativeDamage } =
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
      energyDrops: damageEnemy(enemy, { damage: reactionDamage + transformativeDamage, poiseDamage: 0 }),
      isCritical: false,
      reachingReactions,
      reactions,
    });
  }
  return enemyStrikeResultMap;
};
