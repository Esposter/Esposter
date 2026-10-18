import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { Attribute } from "#src/models/character/Attribute";
import { KitEventKind } from "#src/models/kit/KitEventKind";
import { buffKitMember } from "#src/services/kit/effects/buffKitMember";
import { startKitCooldown } from "#src/services/kit/effects/startKitCooldown";
import { takeOne } from "@esposter/shared";

const HERITAGE_COOLDOWN_ID = "heritageCooldown";

// Heritage at its rank: the character who comes on the field after a switch gains the rank's ATK percentage for the rank's
// Seconds, and holds off the next for the rank's cooldown on its wielder
export const createHeritagePassiveModule = (params: number[]): PassiveModule => {
  const percentage = takeOne(params, 0);
  const seconds = takeOne(params, 1);
  const cooldownSeconds = takeOne(params, 2);
  return {
    onKitEvent: (event, { kitEffectState }, combatant) => {
      if (
        event.kind !== KitEventKind.CharacterSwapped ||
        !startKitCooldown(kitEffectState, combatant.characterId, HERITAGE_COOLDOWN_ID, cooldownSeconds)
      )
        return;
      buffKitMember(kitEffectState, event.characterId, {
        amount: percentage,
        attribute: Attribute.AttackPercent,
        secondsRemaining: seconds,
        source: "heritage",
      });
    },
  };
};
