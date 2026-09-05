import type { Achievement } from "#src/schema/achievements";
import type { UserAchievement } from "#src/schema/userAchievements";

import { schema } from "#src/schema";
import { defineRelationsPart } from "drizzle-orm";

export const userAchievementsRelation = defineRelationsPart(schema, (r) => ({
  userAchievements: {
    achievement: r.one.achievements({
      from: r.userAchievements.achievementId,
      optional: false,
      to: r.achievements.id,
    }),
    user: r.one.users({
      from: r.userAchievements.userId,
      optional: false,
      to: r.users.id,
    }),
  },
}));

export const UserAchievementRelations = {
  achievement: true,
} as const;
export type UserAchievementWithRelations = UserAchievement & { achievement: Achievement };
