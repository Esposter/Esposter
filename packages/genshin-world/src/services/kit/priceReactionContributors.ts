import type { KitContext } from "#src/models/kit/KitContext";
import type { KitReaction } from "#src/models/kit/KitReaction";
import type { Except } from "type-fest";

import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getDeployedReactionBonuses } from "#src/services/kit/getDeployedReactionBonuses";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Each deployed contributor's damage from the price of its level and attributes, priced alone with its own CRIT, in the
// Order the team lists them, as a reaction's contributors are weighted. A Lunar reaction's CRIT Rate, CRIT DMG and DMG Bonus
// Take the party reaction bonuses read for that contributor's own share of it, with the element its hit is dealt in, so a
// Kit's bonus reaches whichever contributor it names, and its Elevation multiplies that share last, as gcsim (MIT)
// Pkg/core/combat/reaction.go prices a contributor
// Https://github.com/genshinsim/gcsim/blob/v2.47.2/pkg/core/combat/reaction.go
export const priceReactionContributors = (
  contributorIds: ReadonlySet<number>,
  context: KitContext,
  price: (level: number, attributeTotalMap: Record<Attribute, number>, damageBonus: number) => number,
  reaction?: Except<KitReaction, "combatant">,
): number[] => {
  const { characterIdCombatantMap, kitEffectState, party, random } = context;
  const lunarReaction =
    reaction && (Object.values(LunarReactionType) as string[]).includes(reaction.reactionType) ? reaction : undefined;
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
