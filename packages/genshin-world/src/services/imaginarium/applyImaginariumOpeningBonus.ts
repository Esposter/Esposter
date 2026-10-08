import type { ImaginariumStats } from "#src/models/imaginarium/ImaginariumStats";

import {
  IMAGINARIUM_OPENING_CHARACTER_BONUS_PERCENT,
  IMAGINARIUM_PERCENT_BASE,
} from "#src/services/imaginarium/constants";

// The stats of an owned opening character for the season: its Max HP, ATK and DEF take the bonus rounded down to whole
// Units, and its Elemental Mastery takes none
export const applyImaginariumOpeningBonus = (stats: ImaginariumStats): ImaginariumStats => {
  const scale = IMAGINARIUM_PERCENT_BASE + IMAGINARIUM_OPENING_CHARACTER_BONUS_PERCENT;
  return {
    attack: Math.floor((stats.attack * scale) / IMAGINARIUM_PERCENT_BASE),
    defense: Math.floor((stats.defense * scale) / IMAGINARIUM_PERCENT_BASE),
    elementalMastery: stats.elementalMastery,
    maxHp: Math.floor((stats.maxHp * scale) / IMAGINARIUM_PERCENT_BASE),
  };
};
