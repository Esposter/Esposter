import type { Combatant } from "#src/models/kit/Combatant";

import { Attribute } from "#src/models/character/Attribute";

// The Elemental Mastery a hit's flat damage takes, from its striker's total at the multiplier
export const elementalMasteryMultiplier = (combatant: Combatant, multiplier: number): number =>
  combatant.attributes.attributeTotalMap[Attribute.ElementalMastery] * multiplier;
