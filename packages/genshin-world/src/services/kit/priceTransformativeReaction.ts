import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { applyReactionInternalCooldown } from "#src/services/combat/internalCooldown/applyReactionInternalCooldown";
import { getEnemyResistance } from "#src/services/enemy/getEnemyResistance";
import { getDeployedReactionBonuses } from "#src/services/kit/getDeployedReactionBonuses";
import { getPartyTransformativeDamage } from "#src/services/kit/getPartyTransformativeDamage";

// The damage one transformative reaction deals on an enemy, priced from the combatant: the share its source's internal
// Cooldown on the enemy deals, with the deployed team's party reaction bonuses to it, against the enemy's RES as its
// Statuses leave it
export const priceTransformativeReaction = (
  kind: EnemyKind,
  enemy: Enemy,
  { element, reactionType }: Pick<TransformativeReaction, "element" | "reactionType">,
  combatant: Combatant,
  context: KitContext,
): number => {
  const partyBonus = getDeployedReactionBonuses({ combatant, element, enemy, reactionType }, context);
  const resistance = getEnemyResistance(kind, enemy, element);
  return (
    applyReactionInternalCooldown(
      enemy.internalCooldownMap,
      combatant.characterId,
      reactionType,
      element,
      enemy.elementalState.seconds,
    ) *
    getPartyTransformativeDamage(
      reactionType,
      combatant.level,
      combatant.attributes.attributeTotalMap[Attribute.ElementalMastery],
      resistance,
      partyBonus.damageBonus,
      partyBonus.additiveBaseDamageBonus,
    )
  );
};
