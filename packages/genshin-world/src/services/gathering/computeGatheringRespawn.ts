import { GatheringRespawn } from "#src/models/gathering/GatheringRespawn";
import {
  ORE_ONE_DAY_RESPAWN_DURATION,
  ORE_THREE_DAYS_RESPAWN_DURATION,
  SPECIALTY_RESPAWN_DURATION,
} from "#src/services/gathering/constants";
import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";

// The moment a picked point is back: a specialty or an ore after its duration, and any other at the game's midnight that
// Follows the pick, in the game's time zone
export const computeGatheringRespawn = (pickedAt: Temporal.Instant, respawn: GatheringRespawn): Temporal.Instant => {
  if (respawn === GatheringRespawn.Daily)
    return pickedAt.toZonedDateTimeISO(GAME_TIME_ZONE).startOfDay().add({ days: 1 }).toInstant();
  if (respawn === GatheringRespawn.OneDay) return pickedAt.add(ORE_ONE_DAY_RESPAWN_DURATION);
  if (respawn === GatheringRespawn.ThreeDays) return pickedAt.add(ORE_THREE_DAYS_RESPAWN_DURATION);
  return pickedAt.add(SPECIALTY_RESPAWN_DURATION);
};
