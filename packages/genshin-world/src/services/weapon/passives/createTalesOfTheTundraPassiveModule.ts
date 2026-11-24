import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { takeOne } from "@esposter/shared";

// The different Elemental Types the deployed team needs for the passive's Elemental Mastery, as its text gives them
const ELEMENTAL_TYPES_FOR_ELEMENTAL_MASTERY = 3;

// Tales of the Tundra at its rank: its wielder's Elemental Mastery rises by the rank's amount while the deployed team
// Holds at least three different Elemental Types, a member with none counting as no type
export const createTalesOfTheTundraPassiveModule = (params: number[]): PassiveModule => {
  const elementalMastery = takeOne(params, 0);
  return {
    getPassiveBonuses: (_combatant, _healthShare, deployedCombatants) =>
      new Set(deployedCombatants.flatMap(({ element }) => (element === undefined ? [] : [element]))).size >=
      ELEMENTAL_TYPES_FOR_ELEMENTAL_MASTERY
        ? [{ amount: elementalMastery, attribute: Attribute.ElementalMastery }]
        : [],
  };
};
