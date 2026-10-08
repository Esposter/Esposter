import type { ImaginariumStats } from "#src/models/imaginarium/ImaginariumStats";

// The characters that perform each stage of a run, its Principal Cast, each spending one of its Vigor on the stage
export const IMAGINARIUM_PERFORMER_COUNT = 4;
// The Vigor each character has for a run, which only a Mystery Cache's option restores, and that is not built
export const IMAGINARIUM_VIGOR = 2;
// The Blessing Level each Alternate Cast member past the number its difficulty asks adds
export const IMAGINARIUM_BLESSING_LEVEL_PER_EXTRA_MEMBER = 2;
// What one level of Blessing adds to a cast member, as the wiki gives it: Max HP, ATK, DEF and Elemental Mastery
export const IMAGINARIUM_BLESSING_LEVEL_STATS: Readonly<ImaginariumStats> = {
  attack: 50,
  defense: 50,
  elementalMastery: 20,
  maxHp: 800,
};
// The multiple a special guest's Blessing Level stats are given at, twice a cast member's
export const IMAGINARIUM_SPECIAL_GUEST_BLESSING_MULTIPLIER = 2;
// The percent an owned opening character takes more of its Max HP, ATK and DEF for the season, against a base of one hundred
export const IMAGINARIUM_OPENING_CHARACTER_BONUS_PERCENT = 20;
export const IMAGINARIUM_PERCENT_BASE = 100;
// The Stellas an act's star challenge gives, every reward of a run taking this many
export const IMAGINARIUM_STELLAS_PER_REWARD = 3;
