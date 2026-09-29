import type { AchievementInAchievement } from "#src/schema/achievement/achievementsInAchievement";
import type { UserAchievementInAchievement } from "#src/schema/achievement/userAchievementsInAchievement";

import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const userAchievementsInAchievementRelation = defineRelationsPart(schema, (r) => ({
  userAchievementsInAchievement: {
    achievement: r.one.achievementsInAchievement({
      from: r.userAchievementsInAchievement.achievementId,
      optional: false,
      to: r.achievementsInAchievement.id,
    }),
    user: r.one.usersInAuth({ from: r.userAchievementsInAchievement.userId, optional: false, to: r.usersInAuth.id }),
  },
}));

export const UserAchievementInAchievementRelations = { achievement: true } as const;

export type UserAchievementInAchievementWithRelations = UserAchievementInAchievement & {
  achievement: AchievementInAchievement;
};
