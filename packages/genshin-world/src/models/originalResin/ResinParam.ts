import { z } from "zod";

// The Original Resin constants the game's constant table holds in one row, published as the stats dataset's `resin`
export interface ResinParam {
  // The most Original Resin regenerates to, a point each regeneration interval while it is below
  originalResinCap: number;
  // The most Original Resin a refill fills to, past the regeneration cap
  originalResinRefillCap: number;
  // The minutes one point of Original Resin takes to regenerate
  originalResinRegenMinutes: number;
  // The Primogems each refill of a game day costs, in order, and a day holds as many refills as this has prices
  primogemResinRefillPrices: number[];
  // The Original Resin a Primogem refill restores
  primogemResinRestore: number;
}

export const resinParamSchema = z.object({
  originalResinCap: z.int().positive(),
  originalResinRefillCap: z.int().positive(),
  originalResinRegenMinutes: z.int().positive(),
  primogemResinRefillPrices: z.array(z.int().positive()),
  primogemResinRestore: z.int().positive(),
}) satisfies z.ZodType<ResinParam>;
