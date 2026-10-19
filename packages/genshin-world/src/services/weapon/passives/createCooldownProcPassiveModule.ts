import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { KitEvent } from "#src/models/kit/KitEvent";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";
import { takeOne } from "@esposter/shared";

// A passive whose proc, each time an event its predicate names happens to its wielder, has the rank's chance to happen
// And holds off the next for the rank's cooldown in seconds. A roll inside the cooldown draws nothing, and a proc does
// What its effect names
export const createCooldownProcPassiveModule = (
  params: number[],
  cooldownId: string,
  checkIsProcEvent: (event: KitEvent, combatant: Combatant) => boolean,
  onProc: (context: KitContext, combatant: Combatant) => void,
): PassiveModule => {
  const chance = takeOne(params, 0);
  const cooldownSeconds = takeOne(params, 1);
  return {
    onKitEvent: (event, context, combatant) => {
      if (!checkIsProcEvent(event, combatant)) return;
      if (checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, cooldownId)) return;
      if (context.random() >= chance) return;
      addKitStatus(context.kitEffectState, combatant.characterId, {
        id: cooldownId,
        secondsRemaining: cooldownSeconds,
      });
      onProc(context, combatant);
    },
  };
};
