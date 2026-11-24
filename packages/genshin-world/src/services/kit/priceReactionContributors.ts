import type { KitContext } from "#src/models/kit/KitContext";
import type { KitReaction } from "#src/models/kit/KitReaction";
import type { Except } from "type-fest";

import { Attribute } from "#src/models/character/Attribute";
import { checkIsLunarReactionType } from "#src/services/combat/checkIsLunarReactionType";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getDeployedReactionBonuses } from "#src/services/kit/getDeployedReactionBonuses";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Each deployed contributor's damage is priced alone with its own CRIT, from the price of its level and attributes.
// Contributors are priced in the order the team lists them, as a reaction's contributors are weighted.
// A Lunar reaction's CRIT Rate, CRIT DMG and DMG Bonus take the party's reaction bonuses for that contributor's share.
// The share is taken in the element its hit is dealt in, so a Kit's bonus reaches whichever contributor it names.
// Its Elevation multiplies that share last, as gcsim (MIT) pkg/core/combat/reaction.go prices a contributor.
// https://github.com/genshinsim/gcsim/blob/v2.47.2/pkg/core/combat/reaction.go
export const priceReactionContributors = (
  contributorIds: ReadonlySet<number>,
  context: KitContext,
  price: (level: number, attributeTotalMap: Record<Attribute, number>, damageBonus: number) => number,
  reaction?: Except<KitReaction, "combatant">,
): number[] => {
  const { characterIdCombatantMap, kitEffectState, party, random } = context;
  const lunarReaction = reaction && checkIsLunarReactionType(reaction.reactionType) ? reaction : undefined;
  return getDeployedCharacterIds(party).flatMap((characterId) => {
    const combatant = characterIdCombatantMap.get(characterId);
    if (!combatant || !contributorIds.has(characterId)) return [];
    const { attributes, level } = getBuffedCombatant(
      combatant,
      kitEffectState.effects,
      party,
      characterIdCombatantMap,
      context.body.position,
    );
    const { attributeTotalMap } = attributes;
    const bonuses = lunarReaction && getDeployedReactionBonuses({ ...lunarReaction, combatant }, context);
    const damage = price(level, attributeTotalMap, bonuses?.damageBonus ?? 0) * (1 + (bonuses?.elevationBonus ?? 0));
    const criticalRate = attributeTotalMap[Attribute.CriticalRate] + (bonuses?.criticalRateBonus ?? 0);
    const criticalDamage = attributeTotalMap[Attribute.CriticalDamage] + (bonuses?.criticalDamageBonus ?? 0);
    return [random() < criticalRate ? damage * (1 + criticalDamage) : damage];
  });
};
