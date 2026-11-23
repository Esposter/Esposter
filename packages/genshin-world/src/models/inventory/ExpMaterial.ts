import { z } from "zod";

// An item the game takes as EXP: its id and how much EXP one of it gives, before any bonus its use adds
export interface ExpMaterial {
  experience: number;
  id: number;
}

export const expMaterialSchema = z.object({
  experience: z.int().positive(),
  id: z.int().positive(),
}) satisfies z.ZodType<ExpMaterial>;
