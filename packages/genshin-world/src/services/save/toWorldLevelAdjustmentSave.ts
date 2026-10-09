import type { WorldLevelAdjustment } from "#src/models/adventureRank/WorldLevelAdjustment";
import type { WorldLevelAdjustmentSave } from "#src/models/adventureRank/WorldLevelAdjustmentSave";

// The adjustment's moment of change as its ISO string, the save's form of it, left out until the player has changed it
export const toWorldLevelAdjustmentSave = ({
  changedAt,
  isLowered,
}: WorldLevelAdjustment): WorldLevelAdjustmentSave => ({
  ...(changedAt === undefined ? {} : { changedAt: changedAt.toString() }),
  isLowered,
});
