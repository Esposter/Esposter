// The hours of the game's day a fishing pool's day stock is drawn in, from the day's start up to the night's, and the
// Night stock otherwise, on the game's clock
export const FISHING_DAY_START_HOUR = 6;
export const FISHING_NIGHT_START_HOUR = 18;
// How long a point stays emptied after its fish are caught before its stock is back in full
export const FISH_STOCK_REFILL_DURATION = Temporal.Duration.from({ hours: 72 });
// Provisional: the tension bar's full range, in the units the fish's zone widths, offsets and speeds are read in, which
// The table's widths and offsets fit a bar of one hundred. The fishing-reel recording on the roadmap's Recordings owed
// List sets its scale
export const REEL_BAR_MAX = 100;
// Provisional: the same recording sets how many seconds the line may lie out of its zone before it breaks
export const REEL_LOST_OUT_OF_ZONE_SECONDS = 3;
// The Serenitea Pot as the bag holds it: the widget material the game names by its own text. Fishing needs one owned
export const SERENITEA_POT_ITEM_ID = 220026;
// The main quest the wiki names beside the Pot for the unlock, Exploding Population, by the id its progress is saved under.
// The save carries a quest only once it is in the carried quests, which holds it out for now
export const SERENITEA_POT_QUEST_ID = "70661";
