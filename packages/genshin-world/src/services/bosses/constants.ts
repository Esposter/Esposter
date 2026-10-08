// A normal boss comes back this long after its Trounce Blossom is claimed, and not until then while it is unclaimed
export const BOSS_RESPAWN_AFTER_CLAIM_DURATION: Temporal.Duration = Temporal.Duration.from({ seconds: 5 });
// The weekday a weekly boss's claims reset on, as Temporal numbers it: Monday, at the daily reset's hour
export const WEEKLY_RESET_DAY_OF_WEEK = 1;
