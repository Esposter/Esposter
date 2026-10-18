import type { ReputationBountyHunt } from "#src/models/reputation/ReputationBountyHunt";

import { EnemyKindId } from "#src/models/enemy/EnemyKindId";
import { GAME_DAY_START_HOUR } from "#src/services/time/constants";
import { describe } from "vitest";

// The epoch is a Thursday, so the Monday that starts its week is four days on, at the server's 04:00 reset
const epoch = Temporal.Instant.fromEpochMilliseconds(0);
export const weeklyReset = epoch.add({ hours: 24 * 4 - GAME_DAY_START_HOUR });
export const now = weeklyReset.add({ hours: 24 * 2 });
// The hunt a taken bounty's camp and its defeat are both read against, its target standing at the spawn point
export const HUNT: ReputationBountyHunt = {
  bountyId: 3,
  isTargetDefeated: false,
  regionId: 7,
  spawn: [100, 0, 200],
  targetEnemyKindId: EnemyKindId.HilichurlFighter,
};

describe.todo("constants");
