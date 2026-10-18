import type { GcgLevels } from "#src/models/gcg/GcgLevels";

import { z } from "zod";

// The levels slice as `genshin:assets gcg` writes it: each Player Level's total EXP, and each challenger's duels with the
// Level that opens each
export const gcgLevelsSchema = z.object({
  challengerGames: z.record(z.string(), z.array(z.object({ gameId: z.int().positive(), level: z.int().positive() }))),
  playerLevels: z.array(z.object({ exp: z.int().nonnegative(), level: z.int().positive() })),
}) satisfies z.ZodType<GcgLevels>;
