import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";

import { addKitStatus } from "#src/services/kit/effects/addKitStatus";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";

// Whether a proc the passive rolls happens: it does not while its cooldown runs, and then the roll must pass. A proc
// Starts the cooldown for the seconds given, and a roll inside the cooldown draws nothing
export const rollPassiveCooldownProc = (
  context: KitContext,
  combatant: Combatant,
  cooldownId: string,
  chance: number,
  cooldownSeconds: number,
): boolean => {
  if (
    checkIsKitStatusActive(context.kitEffectState.effects, combatant.characterId, cooldownId) ||
    context.random() >= chance
  )
    return false;
  addKitStatus(context.kitEffectState, combatant.characterId, { id: cooldownId, secondsRemaining: cooldownSeconds });
  return true;
};
