// The day of the month a monthly good's limit comes back on, at the game's daily hour
export const MONTHLY_REFRESH_DAY_OF_MONTH = 1;
// The moment a good that never refreshes counts its purchases from, before any of them
export const SHOP_NEVER_REFRESHED_AT = Temporal.Instant.fromEpochMilliseconds(0);
// How many pairs of characters Paimon's Bargains' rotation holds, and the offset that puts January on the fourth of them
export const PAIMON_BARGAINS_PAIR_COUNT = 6;
export const PAIMON_BARGAINS_PAIR_OFFSET = 2;
