import { GAME_TIME_ZONE } from "#src/services/time/constants";

// The hour of the game's day an instant falls in, on the game's clock
export const computeGameHour = (now: Temporal.Instant): number => now.toZonedDateTimeISO(GAME_TIME_ZONE).hour;
