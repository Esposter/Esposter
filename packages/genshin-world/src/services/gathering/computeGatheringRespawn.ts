import { GatheringRespawn } from "#src/models/gathering/GatheringRespawn";
import {
  ORE_THREE_DAYS_RESPAWN_DURATION,
  ORE_TWO_DAYS_RESPAWN_DURATION,
  SPECIALTY_RESPAWN_DURATION,
} from "#src/services/gathering/constants";
import { computeNextHourOfDay } from "#src/services/time/computeNextHourOfDay";
import { GATHERING_DAILY_RESPAWN_HOUR } from "#src/services/time/constants";

// The moment a picked point is back: a specialty or an ore after its duration, and a daily point at the game's midnight
// After the pick, in the game's time zone
export const computeGatheringRespawn = (pickedAt: Temporal.Instant, respawn: GatheringRespawn): Temporal.Instant => {
  if (respawn === GatheringRespawn.Daily) return computeNextHourOfDay(pickedAt, GATHERING_DAILY_RESPAWN_HOUR);
  if (respawn === GatheringRespawn.TwoDays) return pickedAt.add(ORE_TWO_DAYS_RESPAWN_DURATION);
  if (respawn === GatheringRespawn.ThreeDays) return pickedAt.add(ORE_THREE_DAYS_RESPAWN_DURATION);
  return pickedAt.add(SPECIALTY_RESPAWN_DURATION);
};
