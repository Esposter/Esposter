import { z } from "zod";

// A Friendship Level as the game's table gives it: its number, and the total Companionship EXP a character needs to reach
// It, the EXP of every level below it summed
export interface FriendshipLevel {
  exp: number;
  level: number;
}

export const friendshipLevelSchema = z.object({
  exp: z.int().nonnegative(),
  level: z.int().positive(),
}) satisfies z.ZodType<FriendshipLevel>;
