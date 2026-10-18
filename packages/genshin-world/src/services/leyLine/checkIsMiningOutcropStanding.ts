import { computeNextDailyReset } from "#src/services/time/computeNextDailyReset";

// Whether a mining outcrop stands in the world now: one not mined does, and a mined one stands again once its respawn
// Has come, which is the day's reset after the one at or before the mining
export const checkIsMiningOutcropStanding = (minedAt: Temporal.Instant | undefined, now: Temporal.Instant): boolean =>
  minedAt === undefined || Temporal.Instant.compare(now, computeNextDailyReset(minedAt)) >= 0;
