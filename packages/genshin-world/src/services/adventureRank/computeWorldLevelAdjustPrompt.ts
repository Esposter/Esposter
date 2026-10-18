import type { WorldLevelAdjustment } from "#src/models/adventureRank/WorldLevelAdjustment";
import type { WorldLevelAdjustPrompt } from "#src/models/adventureRank/WorldLevelAdjustPrompt";

import { computeWorldLevel } from "#src/services/adventureRank/computeWorldLevel";

// The prompt a Change World Level button opens: the World Level the player plays at, and the one the change sets, which
// Lowers it by one when it is not lowered yet, and restores it once it is
export const computeWorldLevelAdjustPrompt = (
  unlockedWorldLevel: number,
  adjustment: WorldLevelAdjustment,
): WorldLevelAdjustPrompt => ({
  adjustedWorldLevel: computeWorldLevel(unlockedWorldLevel, { isLowered: !adjustment.isLowered }),
  currentWorldLevel: computeWorldLevel(unlockedWorldLevel, adjustment),
  isLowering: !adjustment.isLowered,
});
