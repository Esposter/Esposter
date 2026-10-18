// The lowest rank a Trust Rank or an Adeptal Energy rank can read as, the first row of each table
export const HOME_MINIMUM_RANK = 1;
// The Adventure Rank the Serenitea Pot opens the realm at, and below which it does not
export const HOME_REALM_UNLOCK_RANK = 28;
// Provisional: a Realm Currency or Realm Bounty rate counts per real hour, which a recording of a realm's store across one
// Hour settles, on the roadmap's recordings owed
export const HOME_RATE_PERIOD_SECONDS = 3600;
// The bound's counts: eight realms, each with four exterior areas and seven interior ones, and the furnishings an area
// Holds at most as the wiki's Load page gives them, 449 an exterior area and 149 a room. A save's placements are
// Bounded by the most the realms' areas hold at those counts
export const HOME_REALM_COUNT = 8;
export const HOME_EXTERIOR_AREA_COUNT = 4;
export const HOME_INTERIOR_AREA_COUNT = 7;
export const HOME_EXTERIOR_FURNISHING_LIMIT = 449;
export const HOME_INTERIOR_FURNISHING_LIMIT = 149;
// The most placements a save holds. The dump's own scenes hold fewer, so this is a ceiling that every save the game
// Allows fits
export const MAX_HOME_PLACEMENT_COUNT =
  HOME_REALM_COUNT *
  (HOME_EXTERIOR_AREA_COUNT * HOME_EXTERIOR_FURNISHING_LIMIT +
    HOME_INTERIOR_AREA_COUNT * HOME_INTERIOR_FURNISHING_LIMIT);
