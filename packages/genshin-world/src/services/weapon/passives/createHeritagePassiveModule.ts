import type { WeaponPassiveModule } from "#src/models/weapon/WeaponPassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

const HERITAGE_COOLDOWN_ID = "heritageCooldown";

// Heritage at its rank: the character who comes on the field after a switch gains the rank's ATK percentage for the rank's
// Seconds, and holds off the next for the rank's cooldown on its wielder
export const createHeritagePassiveModule = (params: number[]): WeaponPassiveModule => {
  const percentage = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.CharacterSwapped ||
        checkIsKitStatusActive(kitEffectState.effects, combatant.characterId, HERITAGE_COOLDOWN_ID)
      )
        return;
      addKitStatus(kitEffectState, combatant.characterId, {
        id: HERITAGE_COOLDOWN_ID,
        secondsRemaining: cooldownSeconds,
      });
      buffKitMember(kitEffectState, event.characterId, {
        amount: percentage,
        attribute: Attribute.AttackPercent,
        secondsRemaining: seconds,
        source: "heritage",
      });
    },
  };
};
