import type { Combatant } from "#src/models/kit/Combatant";

import type { Attribute } from "#src/models/character/Attribute";
import { computeCharacterStats } from "#src/services/character/computeCharacterStats";

// The combatant with each bonus added to its attribute total, and its Max HP, ATK and DEF built from those totals
// Again, so a percentage raises them too. A combatant given no bonus is returned as it stands
export const applyCombatantBonuses = (
  combatant: Combatant,
  bonuses: readonly { amount: number; attribute: Attribute }[],
): Combatant => {
  if (bonuses.length === 0) return combatant;
  const attributeTotalMap = { ...combatant.attributes.attributeTotalMap };
  for (const { amount, attribute } of bonuses) attributeTotalMap[attribute] += amount;
  return {
    ...combatant,
    attributes: { ...combatant.attributes, ...computeCharacterStats(attributeTotalMap), attributeTotalMap },
  };
};
