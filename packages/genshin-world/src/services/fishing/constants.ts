// The hours of the game's day a fishing pool's day stock is drawn in, from the day's start up to the night's, and the
// Night stock otherwise, on the game's clock
export const FISHING_DAY_START_HOUR = 6;
export const FISHING_NIGHT_START_HOUR = 18;
// How long a point stays emptied after its fish are caught before its stock is back in full
export const FISH_STOCK_REFILL_DURATION = Temporal.Duration.from({ hours: 72 });
// Provisional: the fishing-reel recording on the roadmap's Recordings owed list sets how far the tension rises a second
// While the reel is held and falls while it is not, in shares of the line's full range
export const REEL_TENSION_RATE = 0.5;
// Provisional: the same recording sets how many seconds the line may lie out of its zone before it breaks
export const REEL_LOST_OUT_OF_ZONE_SECONDS = 3;
