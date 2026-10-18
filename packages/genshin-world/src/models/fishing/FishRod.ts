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
  // The dump omits a zero field: an omitted multiplier reads as one, so the rod leaves the reel unchanged, and an omitted
  // City or maximum reads as zero
  attackAcc: z.number().nonnegative().default(1),
  attackMag: z.number().nonnegative().default(1),
  baseAttack: z.number().nonnegative(),
  cityId: z.int().nonnegative().default(0),
  id: z.int().positive(),
  maxAttack: z.number().nonnegative().default(0),
}) satisfies z.ZodType<FishRod>;
