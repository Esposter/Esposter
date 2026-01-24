import type { Achievement } from "@/schema/achievements";
import type { UserAchievement } from "@/schema/userAchievements";

import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const userAchievementsRelation = defineRelationsPart(schema, (r) => ({
  userAchievements: {
    achievement: r.one.achievements({
      from: r.userAchievements.achievementId,
      to: r.achievements.id,
    }),
    user: r.one.users({
      from: r.userAchievements.userId,
      to: r.users.id,
    }),
  },
}));
// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const UserAchievementRelations = {
  achievement: true,
} as const;
export type UserAchievementWithRelations = UserAchievement & { achievement: Achievement };
