import type { KitEffect } from "#src/models/kit/KitEffect";

import { NIGHTSOUL_BLESSING_STATUS_ID } from "#src/services/kit/constants";
import { findKitStatus } from "#src/services/kit/effects/findKitStatus";

// Whether a character is in its Nightsoul's Blessing, which holds its Nightsoul points for as long as it lasts
export const hasKitNightsoulBlessing = (effects: readonly KitEffect[], characterId: number): boolean =>
  findKitStatus(effects, characterId, NIGHTSOUL_BLESSING_STATUS_ID) !== undefined;
