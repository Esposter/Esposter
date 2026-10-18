import type { GcgLevels } from "#src/models/gcg/GcgLevels";

import { z } from "zod";

// The levels slice as `genshin:assets gcg` writes it: each Player Level's total EXP, the locks that hold the Player Level
// until their main quest is done, and each challenger's duels with the level that opens each
export const gcgLevelsSchema = z.object({
  challengerGames: z.record(z.string(), z.array(z.object({ gameId: z.int().positive(), level: z.int().positive() }))),
  playerLevelLocks: z.array(z.object({ unlockLevel: z.int().positive(), unlockMainQuestId: z.string() })),
  playerLevels: z.array(z.object({ exp: z.int().nonnegative(), level: z.int().positive() })),
}) satisfies z.ZodType<GcgLevels>;
