import type { KitEffectState } from "#src/models/kit/KitEffectState";

import { KIT_SWAP_LOCK_ID } from "#src/services/kit/constants";
import { addKitStatus } from "#src/services/kit/effects/addKitStatus";

// Starts a swap lock on a character for these seconds, which holds a swap off them while it lasts, and restarts the one
// They hold: a skill's onStart starts it beside the stance it enters, and the stance's end ends it
export const addKitSwapLock = (kitEffectState: KitEffectState, characterId: number, secondsRemaining: number): void => {
  addKitStatus(kitEffectState, characterId, { id: KIT_SWAP_LOCK_ID, secondsRemaining });
};
