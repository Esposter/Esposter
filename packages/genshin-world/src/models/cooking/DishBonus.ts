import { Attribute } from "#src/models/character/Attribute";
import { z } from "zod";

// A dish's bonus when it is eaten, as its buff names it: the stat each clause of its description adds, a percentage kept
// As a fraction, and the seconds it lasts. Its source is the ability its buff names, so a dish of the same kind restarts
// The bonus rather than stacking it
export interface DishBonus {
  attributes: { amount: number; attribute: Attribute }[];
  seconds: number;
  source: string;
}

export const dishBonusSchema = z.object({
  attributes: z.array(z.object({ amount: z.number(), attribute: z.enum(Attribute) })).min(1),
  seconds: z.number().positive(),
  source: z.string().min(1),
}) satisfies z.ZodType<DishBonus>;
