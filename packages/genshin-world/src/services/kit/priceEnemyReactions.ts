import type { Reaction } from "#src/models/combat/Reaction";
import type { TransformativeReaction } from "#src/models/combat/TransformativeReaction";
import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { EnemyKind } from "#src/models/enemy/EnemyKind";
import type { Combatant } from "#src/models/kit/Combatant";
import type { EnemyReactionPricing } from "#src/models/kit/EnemyReactionPricing";
import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { AmplifyingReactionType } from "#src/models/combat/AmplifyingReactionType";
import { CatalyzeReactionType } from "#src/models/combat/CatalyzeReactionType";
import { TransformativeReactionType } from "#src/models/combat/TransformativeReactionType";
import { applyBluntHit } from "#src/services/combat/aura/applyBluntHit";
import { getAmplifyingMultiplier } from "#src/services/combat/damage/getAmplifyingMultiplier";
import { getCatalyzeBonus } from "#src/services/combat/damage/getCatalyzeBonus";
import { TransformativeReactionPoiseDamageMap } from "#src/services/combat/damage/TransformativeReactionPoiseDamageMap";
import { applySimultaneousReactionInternalCooldown } from "#src/services/combat/internalCooldown/applySimultaneousReactionInternalCooldown";
import { TransformativeReactionReachRadiusMap } from "#src/services/combat/reach/TransformativeReactionReachRadiusMap";
import { addSuperconductStatus } from "#src/services/enemy/addSuperconductStatus";
import { getDeployedReactionBonuses } from "#src/services/kit/getDeployedReactionBonuses";
import { priceTransformativeReaction } from "#src/services/kit/priceTransformativeReaction";

// The reactions an element of the combatant's triggered on an enemy, priced from the combatant, written into the enemy
// In place. A Superconduct takes its Physical RES down first. Melt and Vaporize amplify the damage that triggered them, and
// Aggravate and Spread add to its base, each raised by the deployed team's party reaction DMG Bonus inside its Elemental
// Mastery term, as gcsim (MIT) pkg/enemy/damage.go and pkg/core/combat/reaction.go read it. Each transformative reaction
// That lands adds its own hit's Poise damage, an Overloaded's explosion's
export const priceEnemyReactions = (
  kind: EnemyKind,
  enemy: Enemy,
  reactions: readonly Reaction[],
  combatant: Combatant,
  element: Element | undefined,
  context: KitContext,
): EnemyReactionPricing => {
  const { level } = combatant;
  const elementalMastery = combatant.attributes.attributeTotalMap[Attribute.ElementalMastery];
  const { seconds } = enemy.elementalState;
  if (reactions.some(({ reactionType }) => reactionType === TransformativeReactionType.Superconduct))
    addSuperconductStatus(enemy);

  let additiveBaseDamageBonus = 0;
  let amplifyingMultiplier = 1;
  let poiseDamage = 0;
  let transformativeDamage = 0;
  const reachingReactions: TransformativeReaction[] = [];
  // An Overloaded's explosion is a blunt hit that lands after it, so it is priced in turn: its poise drains a Freeze, and a
  // Freeze left shatters
  const pendingReactions = [...reactions];
  for (const reaction of pendingReactions) {
    const { element: reactionElement, reactionType } = reaction;
    if (
      (reactionType === AmplifyingReactionType.Melt || reactionType === AmplifyingReactionType.Vaporize) &&
      element !== undefined
    ) {
      const partyBonus = getDeployedReactionBonuses(
        { combatant, element: reactionElement, enemy, reactionType },
        context,
      );
      amplifyingMultiplier = getAmplifyingMultiplier(reactionType, element, elementalMastery, partyBonus.damageBonus);
    } else if (reactionType === CatalyzeReactionType.Aggravate || reactionType === CatalyzeReactionType.Spread) {
      const partyBonus = getDeployedReactionBonuses(
        { combatant, element: reactionElement, enemy, reactionType },
        context,
      );
      additiveBaseDamageBonus += getCatalyzeBonus(reactionType, level, elementalMastery, partyBonus.damageBonus);
    } else if (
      (reactionType === TransformativeReactionType.Overloaded ||
        reactionType === TransformativeReactionType.Superconduct ||
        reactionType === TransformativeReactionType.ElectroCharged ||
        reactionType === TransformativeReactionType.Swirl ||
        reactionType === TransformativeReactionType.Shattered) &&
      applySimultaneousReactionInternalCooldown(enemy.internalCooldownMap, reactionType, reactionElement, seconds) > 0
    ) {
      if (TransformativeReactionReachRadiusMap[reactionType] !== undefined)
        // oxlint-disable-next-line typescript/no-unsafe-enum-assignment -- the spread brings Reaction's reactionType (the wider ReactionType union), which this literal overrides with the narrowed TransformativeReactionType of the condition above; the literal's reactionType is exactly TransformativeReaction's
        reachingReactions.push({ ...reaction, reactionType });
      const reactionPoiseDamage = TransformativeReactionPoiseDamageMap[reactionType] ?? 0;
      poiseDamage += reactionPoiseDamage;
      if (reactionType === TransformativeReactionType.Overloaded)
        pendingReactions.push(...applyBluntHit(enemy.elementalState, reactionPoiseDamage));
      transformativeDamage += priceTransformativeReaction(
        kind,
        enemy,
        { element: reactionElement, reactionType },
        combatant,
        context,
      );
    }
  }
  return { additiveBaseDamageBonus, amplifyingMultiplier, poiseDamage, reachingReactions, transformativeDamage };
};
