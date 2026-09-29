import type { z } from "zod";

import { selectUserInAuthSchema } from "@esposter/db-schema";

export const readUserAchievementsInputSchema = selectUserInAuthSchema.shape.id.optional();
export type ReadUserAchievementsInput = z.infer<typeof readUserAchievementsInputSchema>;
