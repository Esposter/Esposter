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
// The relation names a query's `with` takes, keyed as drizzle keys them
// oxlint-disable-next-line selector-ban/no-restricted-syntax -- drizzle keys a `with` by its relation names
export const UserAchievementInAchievementRelations = { achievement: true } as const;
