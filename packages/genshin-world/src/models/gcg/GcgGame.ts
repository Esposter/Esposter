import { z } from "zod";

// A duel of the game's own table as a duel plays it: the deck its opponent plays, the deck the game names for the player,
// And the deck the player plays, which is that one when a slice is written for it and the placeholder deck otherwise
export interface GcgGame {
  enemyDeckId: number;
  gamePlayerDeckId: number;
  playerDeckId: number;
}

export const gcgGameSchema = z.object({
  enemyDeckId: z.int().positive(),
  gamePlayerDeckId: z.int().positive(),
  playerDeckId: z.int().positive(),
}) satisfies z.ZodType<GcgGame>;
