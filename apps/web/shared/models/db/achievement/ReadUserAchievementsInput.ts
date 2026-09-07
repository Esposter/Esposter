import type { z } from "zod";

import { selectUserSchema } from "@esposter/db-schema";

export const readUserAchievementsInputSchema = selectUserSchema.shape.id.optional();
export type ReadUserAchievementsInput = z.infer<typeof readUserAchievementsInputSchema>;
