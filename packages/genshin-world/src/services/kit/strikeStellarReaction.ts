import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { CharacterLevelMultiplierMap } from "#src/services/combat/damage/CharacterLevelMultiplierMap";
import { getReactionDamage } from "#src/services/combat/damage/getReactionDamage";
import { sumLunarContributions } from "#src/services/combat/damage/sumLunarContributions";
import { priceReactionContributors } from "#src/services/kit/priceReactionContributors";
import { strikeReactionDamage } from "#src/services/kit/strikeReactionDamage";
import { takeOne } from "@esposter/shared";

// A Stellar reaction's own hit on an enemy, written into it in place, and whether it struck: the reaction's coefficient
// On each contributor's level multiplier and elemental mastery, with no Moonsign bonus, which only a Lunar reaction takes,
// Weighted as the Glimmer damage is (provisional), against the enemy's RES to the element. With no contributor it strikes nothing
export const strikeStellarReaction = (
  enemy: Enemy,
  element: Element,
  coefficient: number,
  contributorIds: ReadonlySet<number>,
  owner: Combatant | undefined,
  context: KitContext,
): boolean => {
  const damages = priceReactionContributors(contributorIds, context, (level, attributeTotalMap) =>
    getReactionDamage(
      coefficient,
      takeOne(CharacterLevelMultiplierMap, level),
      attributeTotalMap[Attribute.ElementalMastery],
      0,
      0,
    ),
  );
  if (damages.length === 0) return false;
  strikeReactionDamage(enemy, element, sumLunarContributions(damages), owner, context);
  return true;
};
