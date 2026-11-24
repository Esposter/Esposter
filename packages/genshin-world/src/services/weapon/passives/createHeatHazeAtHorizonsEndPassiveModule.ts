import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { AttackTag } from "#src/models/combat/AttackTag";
import { checkIsOwnDamageTaken } from "#src/services/kit/checkIsOwnDamageTaken";
import { addPassiveStack } from "#src/services/kit/effects/addPassiveStack";
import { countKitStatusStacks } from "#src/services/kit/effects/countKitStatusStacks";
import { takeOne } from "@esposter/shared";

const DREAM_OF_THE_SCARLET_SANDS_ID = "dreamOfTheScarletSands";

// Heat Haze at Horizon's End at its rank: the wielder gains the rank's share of its Elemental Mastery as bonus ATK, and
// Each Elemental Skill hit it deals adds a stack of the rank's second share for the rank's seconds, up to the rank's
// Maximum stacks. The rank's third amount is not read here, as the text does not state it
export const createHeatHazeAtHorizonsEndPassiveModule = (params: number[]): PassiveModule => {
  const elementalMasteryShare = takeOne(params, 0);
  const stackShare = takeOne(params, 1);
  const seconds = takeOne(params, 2);
  const maximumStacks = takeOne(params, 4);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => {
      const elementalMastery = combatant.attributes.attributeTotalMap[Attribute.ElementalMastery];
      const stacks = countKitStatusStacks(effects, combatant.characterId, DREAM_OF_THE_SCARLET_SANDS_ID);
      return [
        { amount: (elementalMasteryShare + stacks * stackShare) * elementalMastery, attribute: Attribute.Attack },
      ];
    },
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (!checkIsOwnDamageTaken(event, combatant) || event.attackTag !== AttackTag.ElementalSkill) return;
      addPassiveStack(kitEffectState, combatant.characterId, {
        id: DREAM_OF_THE_SCARLET_SANDS_ID,
        maximumStacks,
        seconds,
      });
    },
  };
};
