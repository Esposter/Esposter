import type { AchievementTrigger } from "#src/models/achievement/AchievementTrigger";

import { achievementTriggerSchema } from "#src/models/achievement/AchievementTrigger";
import { z } from "zod";

// One achievement as the game's table holds it: the category it is listed under, its order there, the trigger that counts
// It and the count that finishes it, the tier before it that must be done first (zero for none), the Primogems it pays,
// Its title and description by text id, and whether it is hidden until it is done
export interface Achievement {
  categoryId: number;
  descriptionTextId: string;
  id: number;
  isHidden: boolean;
  orderId: number;
  preStageAchievementId: number;
  primogems: number;
  progress: number;
  titleTextId: string;
  trigger: AchievementTrigger;
}

export const achievementSchema = z.object({
  categoryId: z.int().nonnegative(),
  descriptionTextId: z.string(),
  id: z.int().positive(),
  isHidden: z.boolean(),
  orderId: z.int().positive(),
  preStageAchievementId: z.int().nonnegative(),
  primogems: z.int().nonnegative(),
  progress: z.int().positive(),
  titleTextId: z.string(),
  trigger: achievementTriggerSchema,
}) satisfies z.ZodType<Achievement>;
