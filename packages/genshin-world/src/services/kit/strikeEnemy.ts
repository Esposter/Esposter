import type { Reaction } from "#src/models/combat/Reaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnergyDrop } from "#src/models/enemy/EnergyDrop";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitHit } from "#src/models/kit/KitHit";

import { Attribute } from "#src/models/character/Attribute";
import { AmplifyingReactionType } from "#src/models/combat/AmplifyingReactionType";
import { CatalyzeReactionType } from "#src/models/combat/CatalyzeReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { applyBluntHit } from "#src/services/combat/aura/applyBluntHit";
import { applyElement } from "#src/services/combat/aura/applyElement";
import { ElementDamageBonusAttributeMap } from "#src/services/combat/damage/ElementDamageBonusAttributeMap";
import { getAmplifyingMultiplier } from "#src/services/combat/damage/getAmplifyingMultiplier";
import { getCatalyzeBonus } from "#src/services/combat/damage/getCatalyzeBonus";
import { getDamage } from "#src/services/combat/damage/getDamage";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { applyInternalCooldown } from "#src/services/combat/internalCooldown/applyInternalCooldown";
import { DEFAULT_INTERNAL_COOLDOWN_GROUP } from "#src/services/combat/internalCooldown/constants";
import { computeEnemyStats } from "#src/services/enemy/computeEnemyStats";
import { damageEnemy } from "#src/services/enemy/damageEnemy";
import { getEnemyKind } from "#src/services/enemy/getEnemyKind";
import { ID_SEPARATOR } from "@esposter/shared";

// A kit hit landing on an enemy, written into it in place: a blunt hit first shatters a Freeze, then an elemental hit
// Is applied at the gauge its internal cooldown leaves of it, and the hit's damage takes what its reactions amplify,
// Catalyze or add, with each transformative reaction's damage added to it, before damageEnemy takes it. It returns the
// Energy the hit dropped
export const strikeEnemy = (enemy: Enemy, kitHit: KitHit, combatant: Combatant, random: () => number): EnergyDrop[] => {
  const { elementalState } = enemy;
  const { attack, attributeTotalMap } = combatant.attributes;
  const { gauge, internalCooldownTag, isBlunt, poiseDamage, talentMultiplier } = kitHit;
  const reactions: Reaction[] = isBlunt ? applyBluntHit(elementalState, poiseDamage) : [];
  const element = gauge === undefined ? undefined : combatant.element;
  if (gauge !== undefined && element !== undefined && internalCooldownTag !== undefined) {
    const cooldownKey = `${combatant.characterId}${ID_SEPARATOR}${internalCooldownTag}`;
    const internalCooldown = enemy.internalCooldownMap.get(cooldownKey) ?? { hitIndex: 0, startSeconds: -Infinity };
    enemy.internalCooldownMap.set(cooldownKey, internalCooldown);
    const share = applyInternalCooldown(internalCooldown, DEFAULT_INTERNAL_COOLDOWN_GROUP, elementalState.seconds);
    reactions.push(...applyElement(elementalState, element, gauge * share));
  }

  const kind = getEnemyKind(enemy.enemyKindId);
  const { defense } = computeEnemyStats(kind, enemy.level);
  const elementalMastery = attributeTotalMap[Attribute.ElementalMastery];
  let amplifyingMultiplier = 1;
  let additiveBaseDamageBonus = 0;
  let transformativeDamage = 0;
  for (const { element: reactionElement, reactionType } of reactions) {
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
  }

  const damage = getDamage({
    additiveBaseDamageBonus,
    amplifyingMultiplier,
    attackerLevel: combatant.level,
    criticalDamage: attributeTotalMap[Attribute.CriticalDamage],
    damageBonus:
      attributeTotalMap[
        element === undefined ? Attribute.PhysicalDamageBonus : ElementDamageBonusAttributeMap[element]
      ],
    defense,
    isCritical: random() < attributeTotalMap[Attribute.CriticalRate],
    resistance: element === undefined ? kind.physicalResistance : kind.elementResistances[element],
    stat: attack,
    talentMultiplier,
  });
  return damageEnemy(enemy, { damage: damage + transformativeDamage, poiseDamage });
};
