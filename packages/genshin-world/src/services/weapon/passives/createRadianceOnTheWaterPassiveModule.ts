import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { takeOne } from "@esposter/shared";

const RADIANCE_ON_THE_WATER_ID = "radianceOnTheWater";

// Radiance on the Water (Silver Light) at its rank: each Elemental Skill its wielder uses adds a stack of the rank's
// Elemental Mastery for the rank's seconds, up to the rank's maximum. Each stack is a hold running its own seconds, and
// A skill at the maximum restarts the one that runs out first
export const createRadianceOnTheWaterPassiveModule = (params: number[]): PassiveModule => {
  const elementalMasteryPerStack = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const maximumStacks = takeOne(params, 2);
  return {
    getPassiveBonuses: ({ characterId }, _healthShare, _deployedCombatants, effects) => [
      {
        amount: elementalMasteryPerStack * countKitHolds(effects, characterId, RADIANCE_ON_THE_WATER_ID),
        attribute: Attribute.ElementalMastery,
      },
    ],
    onKitEvent: (event, { kitEffectState }, { characterId }) => {
      if (event.kind !== KitEventKind.SkillUsed || event.characterId !== characterId) return;
      addKitHold(kitEffectState, characterId, {
        id: RADIANCE_ON_THE_WATER_ID,
        maximum: maximumStacks,
        replacesOldest: true,
        seconds,
      });
    },
  };
};
