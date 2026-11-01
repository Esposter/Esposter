import { computeNextHourOfDay } from "#src/services/time/computeNextHourOfDay";
import { MINING_OUTCROP_RESPAWN_HOUR } from "#src/services/time/constants";

// When a mining outcrop mined at `minedAt` stands again: the first 06:00 on the game's clock after the mining
export const computeMiningOutcropRespawn = (minedAt: Temporal.Instant): Temporal.Instant =>
  computeNextHourOfDay(minedAt, MINING_OUTCROP_RESPAWN_HOUR);
