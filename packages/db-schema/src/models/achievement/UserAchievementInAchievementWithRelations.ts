import type { AchievementInAchievement } from "#src/schema/achievement/achievementsInAchievement";
import type { UserAchievementInAchievement } from "#src/schema/achievement/userAchievementsInAchievement";

import { selectAchievementInAchievementSchema } from "#src/schema/achievement/achievementsInAchievement";
import { selectUserAchievementInAchievementSchema } from "#src/schema/achievement/userAchievementsInAchievement";
import { z } from "zod";

export type UserAchievementInAchievementWithRelations = UserAchievementInAchievement & {
  achievement: AchievementInAchievement;
};

export const userAchievementInAchievementWithRelationsSchema = z.object({
  ...selectUserAchievementInAchievementSchema.shape,
  achievement: selectAchievementInAchievementSchema,
}) satisfies z.ZodType<UserAchievementInAchievementWithRelations>;
