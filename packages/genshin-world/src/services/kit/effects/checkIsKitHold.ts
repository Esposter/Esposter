import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitStatus } from "#src/models/kit/KitStatus";

import { checkIsKitHoldId } from "#src/services/kit/effects/checkIsKitHoldId";

// Whether an effect is a live hold of a passive's id on a character: a status under that id and the separator, with seconds left
export const checkIsKitHold = (effect: KitEffect, characterId: number, id: string): effect is KitStatus =>
  checkIsKitHoldId(effect, characterId, id) && effect.secondsRemaining > 0;
