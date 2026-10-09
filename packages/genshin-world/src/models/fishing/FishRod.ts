import { z } from "zod";

// A rod as the generated rod slice holds it: the city it is bought in (zero for any), its base attack, its attack's
// Multiplier and accuracy, and its maximum attack, each as the game's table gives it
export interface FishRod {
  attackAcc: number;
  attackMag: number;
  baseAttack: number;
  cityId: number;
  id: number;
  maxAttack: number;
}

export const fishRodSchema = z.object({
  attackAcc: z.number().nonnegative(),
  attackMag: z.number().nonnegative(),
  baseAttack: z.number().nonnegative(),
  cityId: z.int().nonnegative(),
  id: z.int().positive(),
  maxAttack: z.number().nonnegative(),
}) satisfies z.ZodType<FishRod>;
