import { GatheringRespawn } from "#src/models/gathering/GatheringRespawn";
import { SPECIALTY_RESPAWN_DURATION } from "#src/services/gathering/constants";
import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";

// The moment a picked point is back: a specialty after its duration, and any other at the game's midnight that follows
// The pick, in the game's time zone
export const computeGatheringRespawn = (pickedAt: Temporal.Instant, respawn: GatheringRespawn): Temporal.Instant =>
  respawn === GatheringRespawn.Specialty
    ? pickedAt.add(SPECIALTY_RESPAWN_DURATION)
    : pickedAt.toZonedDateTimeISO(GAME_TIME_ZONE).startOfDay().add({ days: 1 }).toInstant();
