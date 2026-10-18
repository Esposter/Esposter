import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { releaseKitHolds } from "#src/services/kit/effects/releaseKitHolds";
import { takeOne } from "@esposter/shared";

const FOCUS_ID = "focus";
const FOCUS_MAXIMUM_STACKS = 5;

// Focus at its rank: each hit its wielder deals adds a stack of the rank's CRIT Rate, up to five.
// The stacks are holds with no end time: a critical hit releases them all and adds none, and any other hit adds one.
// The stacks are a CRIT Rate bonus on the wielder as it is priced, as the game's are a buff on the character, so every
// Roll its wielder makes reads them, a Lunar reaction's included
export const createFocusPassiveModule = (params: number[]): WeaponPassiveModule => {
  const criticalRateBonus = takeOne(params, 0);
  return {
    getPassiveBonuses: (combatant, _healthShare, _deployedCombatants, effects) => [
      {
        amount: criticalRateBonus * countKitHolds(effects, combatant.characterId, FOCUS_ID),
        attribute: Attribute.CriticalRate,
      },
    ],
    onKitEvent: (event, context, combatant) => {
      if (event.kind !== KitEventKind.DamageTaken || event.striker.characterId !== combatant.characterId) return;
      if (event.isCritical) releaseKitHolds(context.kitEffectState, combatant.characterId, FOCUS_ID);
      else
        addKitHold(context.kitEffectState, combatant.characterId, {
          id: FOCUS_ID,
          maximum: FOCUS_MAXIMUM_STACKS,
          seconds: Number.POSITIVE_INFINITY,
        });
    },
  };
};
