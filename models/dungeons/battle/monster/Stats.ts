import { z } from "zod";

export interface Stats {
  maxHp: number;
  baseAttack: number;
}

export const statsSchema = z.object({
  maxHp: z.number().int().positive(),
  baseAttack: z.number().int().positive(),
}) satisfies z.ZodType<Stats>;
