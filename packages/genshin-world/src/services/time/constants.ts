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
// The milliseconds a day holds
export const MILLISECONDS_IN_DAY = 86_400_000;
