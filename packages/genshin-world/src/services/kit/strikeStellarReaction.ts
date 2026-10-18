import type { StellarReactionType } from "#src/models/combat/StellarReactionType";
import type { Element } from "#src/models/Element";
import type { Enemy } from "#src/models/enemy/Enemy";
import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { EnemyState } from "#src/models/enemy/EnemyState";
import { CharacterLevelMultiplierMap } from "#src/services/combat/damage/CharacterLevelMultiplierMap";
import { getReactionDamage } from "#src/services/combat/damage/getReactionDamage";
import { sumLunarContributions } from "#src/services/combat/damage/sumLunarContributions";
import { getDeployedReactionBonuses } from "#src/services/kit/getDeployedReactionBonuses";
import { priceReactionContributors } from "#src/services/kit/priceReactionContributors";
import { strikeReactionDamage } from "#src/services/kit/strikeReactionDamage";
import { getPartyStellarBaseDamageBonus } from "#src/services/party/getPartyStellarBaseDamageBonus";
import { takeOne } from "@esposter/shared";

// A Stellar reaction's own hit on an enemy, written into it in place, and whether it struck: the reaction's coefficient
// On each contributor's level multiplier, raised by the Base DMG Bonus of the deployed team's Stellar Jubilees, elemental
// Mastery and Stellar Glimmer reaction DMG bonus, with no Moonsign bonus, which only a Lunar reaction takes, weighted as the Glimmer damage is (provisional), against the enemy's RES to the element.
// With no contributor, or on an enemy already Dead, it strikes nothing
export const strikeStellarReaction = (
  enemy: Enemy,
  element: Element,
  coefficient: number,
  contributorIds: ReadonlySet<number>,
  owner: Combatant | undefined,
  context: KitContext,
  reactionType?: StellarReactionType,
): boolean => {
  if (enemy.state === EnemyState.Dead) return false;
  // A Stellar reaction its creator makes takes the party's reaction bonuses: the DMG Bonus with the Glimmer's, the flat Base
  // Once, before the enemy's RES as strikeReactionDamage takes it, and the Elevation over both last, as gcsim (MIT)
  // Pkg/core/combat/reaction.go multiplies a contributor's damage and its flat damage alike. A hit that names no reaction, a
  // Stellar Vortex's, takes none
  const bonuses =
    owner && reactionType
      ? getDeployedReactionBonuses({ combatant: owner, element, enemy, reactionType }, context)
      : undefined;
  const { characterIdCombatantMap, kitEffectState, party } = context;
  const baseDamageBonus = getPartyStellarBaseDamageBonus(
    characterIdCombatantMap,
    kitEffectState.effects,
    party,
    context.body.position,
  );
  const damages = priceReactionContributors(
    contributorIds,
    context,
    (level, attributeTotalMap) =>
      getReactionDamage(
        coefficient,
        takeOne(CharacterLevelMultiplierMap, level),
        attributeTotalMap[Attribute.ElementalMastery],
        baseDamageBonus,
        attributeTotalMap[Attribute.StellarGlimmerReactionDamageBonus] + (bonuses?.damageBonus ?? 0),
      ),
    reactionType ? { element, enemy, reactionType } : undefined,
  );
  if (damages.length === 0) return false;
  strikeReactionDamage(
    enemy,
    element,
    (sumLunarContributions(damages) + (bonuses?.additiveBaseDamageBonus ?? 0)) * (1 + (bonuses?.elevationBonus ?? 0)),
    owner,
    context,
  );
  return true;
};
