import type { KitEffect } from "#src/models/kit/KitEffect";

import { checkIsKitHold } from "#src/services/kit/effects/checkIsKitHold";

// The holds of a passive's id a character has, counted as they stand
export const countKitHolds = (effects: readonly KitEffect[], characterId: number, id: string): number =>
  effects.filter((effect) => checkIsKitHold(effect, characterId, id)).length;
