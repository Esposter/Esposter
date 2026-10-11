import type { KitEffect } from "#src/models/kit/KitEffect";

import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

// Whether a character carries a status of an id among the team's effects
export const checkHasKitStatus = (effects: readonly KitEffect[], characterId: number, id: string): boolean =>
  findKitStatus(effects, characterId, id) !== undefined;
