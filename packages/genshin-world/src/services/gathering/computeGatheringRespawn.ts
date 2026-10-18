import { GatheringRespawn } from "#src/models/gathering/GatheringRespawn";
import {
  ORE_THREE_DAYS_RESPAWN_DURATION,
  ORE_TWO_DAYS_RESPAWN_DURATION,
  SPECIALTY_RESPAWN_DURATION,
} from "#src/services/gathering/constants";
import { computeNextDailyReset } from "#src/services/time/computeNextDailyReset";

// The moment a picked point is back: a specialty or an ore after its duration, and a daily point at the first daily reset
// After the pick, in the game's time zone
export const computeGatheringRespawn = (pickedAt: Temporal.Instant, respawn: GatheringRespawn): Temporal.Instant => {
  if (respawn === GatheringRespawn.Daily) return computeNextDailyReset(pickedAt);
  if (respawn === GatheringRespawn.TwoDays) return pickedAt.add(ORE_TWO_DAYS_RESPAWN_DURATION);
  if (respawn === GatheringRespawn.ThreeDays) return pickedAt.add(ORE_THREE_DAYS_RESPAWN_DURATION);
  return pickedAt.add(SPECIALTY_RESPAWN_DURATION);
};
