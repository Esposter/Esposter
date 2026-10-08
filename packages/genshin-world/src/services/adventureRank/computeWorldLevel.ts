import type { WorldLevelAdjustment } from "#src/models/adventureRank/WorldLevelAdjustment";

// The World Level the world plays at: the one unlocked, less the one step the player has lowered it by
export const computeWorldLevel = (unlockedWorldLevel: number, { isLowered }: WorldLevelAdjustment): number =>
  isLowered ? unlockedWorldLevel - 1 : unlockedWorldLevel;
