import { CookingQuality } from "#src/models/cooking/CookingQuality";
import { z } from "zod";

// A character's special dish that a recipe may make in place of its own: the character, the item the special dish is,
// And the chance in percent it replaces the dish cooked at each quality
export interface CookingSpecialty {
  avatarId: number;
  chances: Record<CookingQuality, number>;
  itemId: number;
}

export const cookingSpecialtySchema = z.object({
  avatarId: z.int().positive(),
  chances: z.record(z.enum(CookingQuality), z.int().min(0).max(100)),
  itemId: z.int().positive(),
}) satisfies z.ZodType<CookingSpecialty>;
