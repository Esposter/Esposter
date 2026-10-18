import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitHold } from "#src/services/kit/effects/addKitHold";
import { countKitHolds } from "#src/services/kit/effects/countKitHolds";
import { releaseKitHolds } from "#src/services/kit/effects/releaseKitHolds";
import { takeOne } from "@esposter/shared";

const FOCUS_ID = "focus";
const FOCUS_MAXIMUM_STACKS = 5;

// Focus at its rank: each hit its wielder deals adds a stack of the rank's CRIT Rate, up to five.
// The stacks are holds with no end time: a critical hit releases them all and adds none, and any other hit adds one.
// Each strike its wielder makes is rolled with the CRIT Rate of the stacks the effects hold as it lands
export const createFocusPassiveModule = (params: number[]): WeaponPassiveModule => {
  const criticalRateBonus = takeOne(params, 0);
  return {
    getStrikeCriticalRateBonus: (strike, _enemy, _party, effects) =>
      criticalRateBonus * countKitHolds(effects, strike.combatant.characterId, FOCUS_ID),
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
