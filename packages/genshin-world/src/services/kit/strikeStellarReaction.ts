import type { StellarReactionType } from "#src/models/combat/StellarReactionType";
import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { CharacterLevelMultiplierMap } from "#src/services/combat/damage/CharacterLevelMultiplierMap";
import { getReactionDamage } from "#src/services/combat/damage/getReactionDamage";
import { sumLunarContributions } from "#src/services/combat/damage/sumLunarContributions";
import { getDeployedReactionBonuses } from "#src/services/kit/getDeployedReactionBonuses";
import { priceReactionContributors } from "#src/services/kit/priceReactionContributors";
import { strikeReactionDamage } from "#src/services/kit/strikeReactionDamage";
import { takeOne } from "@esposter/shared";

// A Stellar reaction's own hit on an enemy, written into it in place, and whether it struck: the reaction's coefficient
// On each contributor's level multiplier, elemental mastery and Stellar Glimmer reaction DMG bonus, with no Moonsign bonus,
// Which only a Lunar reaction takes, weighted as the Glimmer damage is (provisional), against the enemy's RES to the element.
// With no contributor it strikes nothing
export const strikeStellarReaction = (
  enemy: Enemy,
  element: Element,
  coefficient: number,
  contributorIds: ReadonlySet<number>,
  owner: Combatant | undefined,
  context: KitContext,
  reactionType?: StellarReactionType,
): boolean => {
  // A Stellar reaction its creator makes takes the party's reaction bonuses: the DMG Bonus with the Glimmer's, and the flat
  // Base once, before the enemy's RES as strikeReactionDamage takes it. A hit that names no reaction, a Stellar Vortex's, takes none
  const bonuses =
    owner && reactionType ? getDeployedReactionBonuses({ combatant: owner, reactionType }, context) : undefined;
  const damages = priceReactionContributors(contributorIds, context, (level, attributeTotalMap) =>
    getReactionDamage(
      coefficient,
      takeOne(CharacterLevelMultiplierMap, level),
      attributeTotalMap[Attribute.ElementalMastery],
      0,
      attributeTotalMap[Attribute.StellarGlimmerReactionDamageBonus] + (bonuses?.damageBonus ?? 0),
    ),
  );
  if (damages.length === 0) return false;
  strikeReactionDamage(
    enemy,
    element,
    sumLunarContributions(damages) + (bonuses?.additiveBaseDamageBonus ?? 0),
    owner,
    context,
  );
  return true;
};
