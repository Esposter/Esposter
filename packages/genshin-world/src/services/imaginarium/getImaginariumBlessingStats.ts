import type { ImaginariumStats } from "#src/models/imaginarium/ImaginariumStats";

import {
  IMAGINARIUM_BLESSING_LEVEL_STATS,
  IMAGINARIUM_SPECIAL_GUEST_BLESSING_MULTIPLIER,
} from "#src/services/imaginarium/constants";

// The stats a Blessing Level adds to one cast member: each stat its level's amount times the level, doubled for a special guest
export const getImaginariumBlessingStats = (blessingLevel: number, isSpecialGuest: boolean): ImaginariumStats => {
  const multiplier = blessingLevel * (isSpecialGuest ? IMAGINARIUM_SPECIAL_GUEST_BLESSING_MULTIPLIER : 1);
  return {
    attack: IMAGINARIUM_BLESSING_LEVEL_STATS.attack * multiplier,
    defense: IMAGINARIUM_BLESSING_LEVEL_STATS.defense * multiplier,
    elementalMastery: IMAGINARIUM_BLESSING_LEVEL_STATS.elementalMastery * multiplier,
    maxHp: IMAGINARIUM_BLESSING_LEVEL_STATS.maxHp * multiplier,
  };
};
