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

// @TODO: https://github.com/drizzle-team/drizzle-orm/issues/695
export const UserAchievementInAchievementRelations = { achievement: true } as const;
