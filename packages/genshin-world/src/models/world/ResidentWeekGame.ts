import { z } from "zod";

// The game a resident's week offers in the weekly guest challenge, the Genius Invokation level it is offered at, and the Lucky
// Coins and Player EXP the week's reward gives at that level
export interface ResidentWeekGame {
  gameId: number;
  gcgLevel: number;
  luckyCoins: number;
  playerExp: number;
}

export const residentWeekGameSchema = z.object({
  gameId: z.int().positive(),
  gcgLevel: z.int().positive(),
  luckyCoins: z.int().nonnegative(),
  playerExp: z.int().nonnegative(),
}) satisfies z.ZodType<ResidentWeekGame>;
