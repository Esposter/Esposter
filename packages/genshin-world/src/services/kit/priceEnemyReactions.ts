import type { Reaction } from "#src/models/combat/Reaction";
import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { Combatant } from "#src/models/kit/Combatant";
import type { EnemyReactionPricing } from "#src/models/kit/EnemyReactionPricing";

import { Attribute } from "#src/models/character/Attribute";
import { AmplifyingReactionType } from "#src/models/combat/AmplifyingReactionType";
import { CatalyzeReactionType } from "#src/models/combat/CatalyzeReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { getAmplifyingMultiplier } from "#src/services/combat/damage/getAmplifyingMultiplier";
import { getCatalyzeBonus } from "#src/services/combat/damage/getCatalyzeBonus";
import { getTransformativeDamage } from "#src/services/combat/damage/getTransformativeDamage";
import { applyReactionInternalCooldown } from "#src/services/combat/internalCooldown/applyReactionInternalCooldown";
import { applySimultaneousReactionInternalCooldown } from "#src/services/combat/internalCooldown/applySimultaneousReactionInternalCooldown";
import { TransformativeReactionReachRadiusMap } from "#src/services/combat/reach/TransformativeReactionReachRadiusMap";
import { addSuperconductStatus } from "#src/services/enemy/addSuperconductStatus";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";

// The reactions an element of the combatant's triggered on an enemy, priced from the combatant, written into the enemy
// In place. A Superconduct takes its Physical RES down first. Melt and Vaporize amplify the damage that triggered them,
// Aggravate and Spread add to its base, and each transformative reaction that lands deals its own damage at the share
// Its source's internal cooldown on the enemy deals, against the enemy's RES as its statuses leave it
export const priceEnemyReactions = (
  kind: EnemyKind,
  enemy: Enemy,
  reactions: readonly Reaction[],
  combatant: Combatant,
  element: Element | undefined,
): EnemyReactionPricing => {
  const { characterId, level } = combatant;
  const elementalMastery = combatant.attributes.attributeTotalMap[Attribute.ElementalMastery];
  const { seconds } = enemy.elementalState;
  if (reactions.some(({ reactionType }) => reactionType === TransformativeReactionType.Superconduct))
    addSuperconductStatus(enemy);

  let additiveBaseDamageBonus = 0;
  let amplifyingMultiplier = 1;
  let transformativeDamage = 0;
  const reachingReactions: TransformativeReaction[] = [];
  for (const reaction of reactions) {
    const { element: reactionElement, reactionType } = reaction;
    if (
      (reactionType === AmplifyingReactionType.Melt || reactionType === AmplifyingReactionType.Vaporize) &&
      element !== undefined
    )
      amplifyingMultiplier = getAmplifyingMultiplier(reactionType, element, elementalMastery);
    else if (reactionType === CatalyzeReactionType.Aggravate || reactionType === CatalyzeReactionType.Spread)
      additiveBaseDamageBonus += getCatalyzeBonus(reactionType, level, elementalMastery);
    else if (
      (reactionType === TransformativeReactionType.Overloaded ||
        reactionType === TransformativeReactionType.Superconduct ||
        reactionType === TransformativeReactionType.ElectroCharged ||
        reactionType === TransformativeReactionType.Swirl ||
        reactionType === TransformativeReactionType.Shattered) &&
      applySimultaneousReactionInternalCooldown(enemy.internalCooldownMap, reactionType, reactionElement, seconds) > 0
    ) {
      if (TransformativeReactionReachRadiusMap[reactionType] !== undefined)
        reachingReactions.push({ ...reaction, reactionType });
      transformativeDamage +=
        applyReactionInternalCooldown(enemy.internalCooldownMap, characterId, reactionType, reactionElement, seconds) *
        getTransformativeDamage(
          reactionType,
          level,
          elementalMastery,
          getEnemyResistance(kind, enemy, reactionElement),
        );
    }
  }
  return { additiveBaseDamageBonus, amplifyingMultiplier, reachingReactions, transformativeDamage };
};
