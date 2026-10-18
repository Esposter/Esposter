import type { KitEffect } from "#src/models/kit/KitEffect";

import { KIT_SWAP_LOCK_ID } from "#src/services/kit/constants";
import { checkIsKitStatusActive } from "#src/services/kit/effects/checkIsKitStatusActive";

// Whether a swap lock holds on a character, so the party may not swap off them while it lasts
// A lock its stance ended reads as none, as the step that drops it runs after
// An empty field slot holds none, as no one stands on it
export const checkIsKitSwapBlocked = (effects: readonly KitEffect[], characterId: number | undefined): boolean =>
  characterId !== undefined && checkIsKitStatusActive(effects, characterId, KIT_SWAP_LOCK_ID);
