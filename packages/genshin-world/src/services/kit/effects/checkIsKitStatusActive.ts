import type { KitEffect } from "#src/models/kit/KitEffect";

import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

// Whether a character carries a status of an id that has not run out, which one running out on this step's own clock
// Has, though it stays among the team's effects until the step drops it
export const checkIsKitStatusActive = (effects: readonly KitEffect[], characterId: number, id: string): boolean =>
  (findKitStatus(effects, characterId, id)?.secondsRemaining ?? 0) > 0;
