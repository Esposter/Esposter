import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

// Ends the status of an id a character carries, if it carries one: it runs out with the next step, which drops it and
// Sends its expiry
export const endKitStatus = (kitEffectState: KitEffectState, characterId: number, id: string): void => {
  const status = findKitStatus(kitEffectState.effects, characterId, id);
  if (status) status.secondsRemaining = 0;
};
