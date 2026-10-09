import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { EnemyStrikeResult } from "#src/models/kit/EnemyStrikeResult";
import type { KitHit } from "#src/models/kit/KitHit";

import { Attribute } from "#src/models/character/Attribute";
import { AmplifyingReactionType } from "#src/models/combat/AmplifyingReactionType";
import { AuraType } from "#src/models/combat/AuraType";
import { CatalyzeReactionType } from "#src/models/combat/CatalyzeReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { Element } from "#src/models/Element";
import { applyBluntHit } from "#src/services/combat/aura/applyBluntHit";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { ElementDamageBonusAttributeMap } from "#src/services/combat/damage/ElementDamageBonusAttributeMap";
import { getAmplifyingMultiplier } from "#src/services/combat/damage/getAmplifyingMultiplier";
import { getCatalyzeBonus } from "#src/services/combat/damage/getCatalyzeBonus";
import { getDamage } from "#src/services/combat/damage/getDamage";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { applyInternalCooldown } from "#src/services/combat/internalCooldown/applyInternalCooldown";
import { DEFAULT_INTERNAL_COOLDOWN_GROUP } from "#src/services/combat/internalCooldown/constants";
import { addEnemyStatus } from "#src/services/enemy/addEnemyStatus";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { readKitStackedHit } from "#src/services/kit/readKitStackedHit";
import { SHATTERING_ICE_CRITICAL_RATE_BONUS } from "#src/services/party/constants";
import { ID_SEPARATOR } from "@esposter/shared";

// A kit hit landing on an enemy, written into it in place: a blunt hit first shatters a Freeze, then an elemental hit
// Is applied at the gauge its internal cooldown leaves of it, and the hit's damage takes what its reactions amplify,
// Catalyze or add, with each transformative reaction's damage added to it, before damageEnemy takes it. The enemy's RES
// To the element is its own less each status's reduction of it. It returns the energy the hit dropped and the reactions
// It triggered
export const strikeEnemy = (
  enemy: Enemy,
  kitHit: KitHit,
  combatant: Combatant,
  random: () => number,
): EnemyStrikeResult => {
  const { elementalState } = enemy;
  const { attack, attributeTotalMap } = combatant.attributes;
  const { gauge, internalCooldownTag, isBlunt } = kitHit;
  const status = kitHit.enemyStatus?.(combatant);
  if (status) addEnemyStatus(enemy, { ...status });
  // A stacked hit's multiplier and poise are read from the enemy's stacks, which the hit then consumes
  const { poiseDamage, talentMultiplier } = readKitStackedHit(enemy, kitHit);
  // Shattering Ice's CRIT Rate reads the enemy as the hit finds it, before its Freeze shatters or its element lands
  const isShatteringIceTarget =
    combatant.elementalResonances.includes(Element.Cryo) &&
    (elementalState.auras.has(AuraType.Freeze) || elementalState.auras.has(AuraType.Cryo));
  const reactions: Reaction[] = isBlunt ? applyBluntHit(elementalState, poiseDamage) : [];
  const element = kitHit.element ?? (gauge === undefined ? undefined : combatant.element);
  if (gauge !== undefined && gauge > 0 && element !== undefined) {
    // A hit with no internal cooldown applies its whole gauge, and one under a cooldown shares it through the cooldown
    let share = 1;
    if (internalCooldownTag !== undefined) {
      const cooldownKey = `${combatant.characterId}${ID_SEPARATOR}${internalCooldownTag}`;
      const internalCooldown = enemy.internalCooldownMap.get(cooldownKey) ?? { hitIndex: 0, startSeconds: -Infinity };
      enemy.internalCooldownMap.set(cooldownKey, internalCooldown);
      share = applyInternalCooldown(internalCooldown, DEFAULT_INTERNAL_COOLDOWN_GROUP, elementalState.seconds);
    }
    reactions.push(...applyElement(elementalState, element, gauge * share));
  }

  const kind = getEnemyKind(enemy.enemyKindId);
  const { defense } = computeEnemyStats(kind, enemy.level);
  const elementalMastery = attributeTotalMap[Attribute.ElementalMastery];
  let amplifyingMultiplier = 1;
  let additiveBaseDamageBonus = 0;
  let transformativeDamage = 0;
  for (const { element: reactionElement, reactionType } of reactions)
    if (
      (reactionType === AmplifyingReactionType.Melt || reactionType === AmplifyingReactionType.Vaporize) &&
      element !== undefined
    )
      amplifyingMultiplier = getAmplifyingMultiplier(reactionType, element, elementalMastery);
    else if (reactionType === CatalyzeReactionType.Aggravate || reactionType === CatalyzeReactionType.Spread)
      additiveBaseDamageBonus = getCatalyzeBonus(reactionType, combatant.level, elementalMastery);
    else if (
      reactionType === TransformativeReactionType.Overloaded ||
      reactionType === TransformativeReactionType.Superconduct ||
      reactionType === TransformativeReactionType.ElectroCharged ||
      reactionType === TransformativeReactionType.Swirl ||
      reactionType === TransformativeReactionType.Shattered
    )
      transformativeDamage += getTransformativeDamage(
        reactionType,
        combatant.level,
        elementalMastery,
        reactionElement === undefined ? kind.physicalResistance : kind.elementResistances[reactionElement],
      );

  const damage = getDamage({
    additiveBaseDamageBonus,
    amplifyingMultiplier,
    attackerLevel: combatant.level,
    criticalDamage: attributeTotalMap[Attribute.CriticalDamage],
    // A hit's own DMG Bonus and an enemy's statuses' DMG taken add to the bonus each hit on it reads
    damageBonus:
      attributeTotalMap[
        element === undefined ? Attribute.PhysicalDamageBonus : ElementDamageBonusAttributeMap[element]
      ] +
      (kitHit.damageBonus ?? 0) +
      enemy.statuses.reduce((total, { damageTakenBonus }) => total + damageTakenBonus, 0),
    defense,
    isCritical:
      random() <
      attributeTotalMap[Attribute.CriticalRate] + (isShatteringIceTarget ? SHATTERING_ICE_CRITICAL_RATE_BONUS : 0),
    resistance:
      element === undefined
        ? kind.physicalResistance
        : kind.elementResistances[element] -
          enemy.statuses.reduce((total, { resistanceReduction }) => total + (resistanceReduction?.[element] ?? 0), 0),
    stat: attack,
    talentMultiplier,
  });
  return { energyDrops: damageEnemy(enemy, { damage: damage + transformativeDamage, poiseDamage }), reactions };
};
