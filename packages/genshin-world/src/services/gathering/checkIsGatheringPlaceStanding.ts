import type { GatheringRespawn } from "#src/models/gathering/GatheringRespawn";

import { computeGatheringRespawn } from "#src/services/gathering/computeGatheringRespawn";

// Whether a point stands in the world now: one never picked does, and a picked one stands again once its respawn has come
export const checkIsGatheringPlaceStanding = (
  pickedAt: Temporal.Instant | undefined,
  respawn: GatheringRespawn,
  now: Temporal.Instant,
): boolean => pickedAt === undefined || Temporal.Instant.compare(now, computeGatheringRespawn(pickedAt, respawn)) >= 0;
