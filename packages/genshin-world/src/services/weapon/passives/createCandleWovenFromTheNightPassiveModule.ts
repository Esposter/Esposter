import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { takeOne } from "@esposter/shared";

// The stacks the other party members give the wielder at most, of both kinds together
const CANDLE_MAXIMUM_STACKS = 3;

// A Candle Woven From the Night at its rank: each other party member gives the wielder a stack of Elemental Mastery
// When it is of The wielder's Elemental Type, and a stack of ATK by the rank's percentage when it is not, up to three
// Stacks in all, the Elemental Mastery ones taken first
export const createCandleWovenFromTheNightPassiveModule = (params: number[]): PassiveModule => {
  const attackPercent = takeOne(params, 0);
  const elementalMastery = takeOne(params, 1);
  return {
    getPassiveBonuses: (combatant, _healthShare, deployedCombatants) => {
      const otherMembers = deployedCombatants.filter((member) => member.characterId !== combatant.characterId);
      const sameElementCount = otherMembers.filter((member) => member.element === combatant.element).length;
      const elementalMasteryStacks = Math.min(sameElementCount, CANDLE_MAXIMUM_STACKS);
      const attackPercentStacks = Math.min(
        otherMembers.length - sameElementCount,
        CANDLE_MAXIMUM_STACKS - elementalMasteryStacks,
      );
      return [
        { amount: elementalMastery * elementalMasteryStacks, attribute: Attribute.ElementalMastery },
        { amount: attackPercent * attackPercentStacks, attribute: Attribute.AttackPercent },
      ];
    },
  };
};
