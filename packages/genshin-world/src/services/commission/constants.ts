// How many commissions are dealt a day, and so how many of them may be claimed
export const COMMISSIONS_PER_DAY = 4;
// The Adventure Rank commissions open at, with the quest that introduces them, which the world does not carry yet
export const COMMISSION_UNLOCK_RANK = 12;
// The Adventure Ranks each band of the game's commission tables spans, and how many bands there are: ranks 1 to 5 are the
// First band, and 56 to 60 the twelfth
export const COMMISSION_RANK_BAND_SIZE = 5;
export const COMMISSION_RANK_BAND_COUNT = 12;
// The Encounter Points a player holds at most, less one for each daily commission finished, and the half points a point is
// Counted in, so that a half point is held whole
export const ENCOUNTER_POINT_STORAGE = 4;
export const HALF_POINTS_PER_ENCOUNTER_POINT = 2;
export const MAX_ENCOUNTER_HALF_POINTS = ENCOUNTER_POINT_STORAGE * HALF_POINTS_PER_ENCOUNTER_POINT;
// The Encounter Points an Archon quest or a Story quest gives on its completion
export const QUEST_ENCOUNTER_POINTS = 4;
// The major version the Long-Term Encounter Points are kept through, reset when the game's major version moves past it
export const LONG_TERM_MAJOR_VERSION = 6;
// The Original Resin spent to convert one Long-Term Encounter Point into an Encounter Point while the daily points fall short
export const LONG_TERM_RESIN_COST = 30;
