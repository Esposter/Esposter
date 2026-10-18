import type { ReactionType } from "#src/models/combat/ReactionType";
import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { LunarReactionType } from "#src/models/combat/LunarReactionType";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getDeployedReactionBonuses } from "#src/services/kit/getDeployedReactionBonuses";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Each deployed contributor's damage from the price of its level and attributes, priced alone with its own CRIT, in the
// Order the team lists them, as a reaction's contributors are weighted. A Lunar reaction's CRIT Rate and CRIT DMG take the
// Party reaction bonuses read for that contributor's own share of it, so a kit's bonus reaches whichever contributor it names
export const priceReactionContributors = (
  contributorIds: ReadonlySet<number>,
  context: KitContext,
  price: (level: number, attributeTotalMap: Record<Attribute, number>) => number,
  reactionType?: ReactionType,
): number[] => {
  const { characterIdCombatantMap, kitEffectState, party, random } = context;
  const isLunar = reactionType !== undefined && (Object.values(LunarReactionType) as string[]).includes(reactionType);
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
    const damage = price(level, attributeTotalMap);
    const bonuses =
      isLunar && reactionType !== undefined
        ? getDeployedReactionBonuses({ combatant, reactionType }, context)
        : undefined;
    const criticalRate = attributeTotalMap[Attribute.CriticalRate] + (bonuses?.criticalRateBonus ?? 0);
    const criticalDamage = attributeTotalMap[Attribute.CriticalDamage] + (bonuses?.criticalDamageBonus ?? 0);
    return [random() < criticalRate ? damage * (1 + criticalDamage) : damage];
  });
};
