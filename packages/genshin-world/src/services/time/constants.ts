// The server clock every reset of the world is read in: the Asia server's zone, UTC+8, which a reader in any other zone shares
export const GAME_TIME_ZONE = "Asia/Shanghai";
// The hour in that zone the daily, weekly and monthly resets fall on, and a moment before it still belongs to the day before
export const GAME_DAY_START_HOUR = 4;
// The day of the week the weekly reset falls on, numbered as Temporal numbers the days from Monday
export const WEEKLY_RESET_DAY_OF_WEEK = 1;
// The day of the month the monthly reset falls on
export const MONTHLY_RESET_DAY_OF_MONTH = 1;
// The days a week holds
export const DAYS_IN_WEEK = 7;
// The game minute the world's clock is read again at, so a reset or a regeneration that passes is seen within the minute
export const WORLD_CLOCK_INTERVAL_MS: number = Temporal.Duration.from({ minutes: 1 }).total("milliseconds");
// The milliseconds a day holds
export const MILLISECONDS_IN_DAY = 86_400_000;
// The seconds a minute holds
export const SECONDS_PER_MINUTE = 60;
// The seconds an hour holds
export const SECONDS_PER_HOUR = 3600;
// The seconds a day holds
export const SECONDS_PER_DAY = 86_400;
