import { z } from "zod";

// One World Level's row of the game's level lock table: the rank cap it raises the Adventure Rank to, the rank it
// Unlocks at, and the main quest it needs first, "" where none is needed
export interface AdventureRankLock {
  rankCap: number;
  unlockMainQuestId: string;
  unlockPlayerLevel: number;
  worldLevel: number;
}

export const adventureRankLockSchema = z.object({
  rankCap: z.int().min(1),
  unlockMainQuestId: z.string(),
  unlockPlayerLevel: z.int().nonnegative(),
  worldLevel: z.int().nonnegative(),
}) satisfies z.ZodType<AdventureRankLock>;
