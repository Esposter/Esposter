// The day of the month a monthly good's limit comes back on, at the game's daily hour
export const MONTHLY_REFRESH_DAY_OF_MONTH = 1;
// The day of the week a weekly good's limit comes back on, at the game's daily hour, numbered as Temporal numbers the days
// From Monday, and the days a week holds
export const WEEKLY_REFRESH_DAY_OF_WEEK = 1;
export const DAYS_IN_WEEK = 7;
// The moment a good that never refreshes counts its purchases from, before any of them
export const SHOP_NEVER_REFRESHED_AT = Temporal.Instant.fromEpochMilliseconds(0);
