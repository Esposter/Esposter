import { z } from "zod";

// One category of achievements as the game's table holds it: its order on the screen, its name by text id, and the
// Namecard its completion pays. A category with no end pays none, and its namecard item is zero
export interface AchievementCategory {
  id: number;
  namecardItemId: number;
  nameTextId: string;
  orderId: number;
}

export const achievementCategorySchema = z.object({
  id: z.int().nonnegative(),
  namecardItemId: z.int().nonnegative(),
  nameTextId: z.string(),
  orderId: z.int().positive(),
}) satisfies z.ZodType<AchievementCategory>;
