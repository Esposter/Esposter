import type { WorldLevelAdjustment } from "#src/models/adventureRank/WorldLevelAdjustment";
import type { WorldLevelAdjustmentSave } from "#src/models/adventureRank/WorldLevelAdjustmentSave";

// The save's moment of change read back into the adjustment's Temporal instant
export const toWorldLevelAdjustment = ({ changedAt, isLowered }: WorldLevelAdjustmentSave): WorldLevelAdjustment => ({
  ...(changedAt === undefined ? {} : { changedAt: Temporal.Instant.from(changedAt) }),
  isLowered,
});
