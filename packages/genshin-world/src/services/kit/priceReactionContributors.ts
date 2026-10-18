import type { KitContext } from "#src/models/kit/KitContext";

import { Attribute } from "#src/models/character/Attribute";
import { getBuffedCombatant } from "#src/services/kit/effects/getBuffedCombatant";
import { getDeployedCharacterIds } from "#src/services/party/getDeployedCharacterIds";

// Each deployed contributor's damage from the price of its level and attributes, priced alone with its own CRIT, in the
// Order the team lists them, as a reaction's contributors are weighted
export const priceReactionContributors = (
  contributorIds: ReadonlySet<number>,
  context: KitContext,
  price: (level: number, attributeTotalMap: Record<Attribute, number>) => number,
): number[] => {
  const { characterIdCombatantMap, kitEffectState, party, random } = context;
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
    return [
      random() < attributeTotalMap[Attribute.CriticalRate]
        ? damage * (1 + attributeTotalMap[Attribute.CriticalDamage])
        : damage,
    ];
  });
};
