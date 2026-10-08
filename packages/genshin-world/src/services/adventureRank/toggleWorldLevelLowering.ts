import type { WorldLevelAdjustment } from "#src/models/adventureRank/WorldLevelAdjustment";

import { WORLD_LEVEL_ADJUSTMENT_COOLDOWN, WORLD_LEVEL_LOWERING_MINIMUM } from "#src/services/adventureRank/constants";

// Lowers the World Level by one, or restores it, at the moment `now`. Lowering needs the World Level unlocked to reach
// Its minimum, and either change waits the cooldown since the last one, so the adjustment returned is the one given
// Where a change is not allowed
export const toggleWorldLevelLowering = (
  adjustment: WorldLevelAdjustment,
  unlockedWorldLevel: number,
  now: Temporal.Instant,
): WorldLevelAdjustment => {
  if (
    adjustment.changedAt !== undefined &&
    Temporal.Instant.compare(now, adjustment.changedAt.add(WORLD_LEVEL_ADJUSTMENT_COOLDOWN)) < 0
  )
    return adjustment;
  if (adjustment.isLowered) return { changedAt: now, isLowered: false };
  if (unlockedWorldLevel < WORLD_LEVEL_LOWERING_MINIMUM) return adjustment;
  return { changedAt: now, isLowered: true };
};
