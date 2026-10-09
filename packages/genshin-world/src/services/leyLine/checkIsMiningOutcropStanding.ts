import { computeMiningOutcropRespawn } from "#src/services/leyLine/computeMiningOutcropRespawn";

// Whether a mining outcrop stands in the world now: one not mined does, and a mined one stands again once its respawn
// Has come
export const checkIsMiningOutcropStanding = (minedAt: Temporal.Instant | undefined, now: Temporal.Instant): boolean =>
  minedAt === undefined || Temporal.Instant.compare(now, computeMiningOutcropRespawn(minedAt)) >= 0;
