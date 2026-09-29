import { schema } from "#src/generated/schema";
import { defineRelationsPart } from "drizzle-orm";

export const achievementsInAchievementRelation = defineRelationsPart(schema, (r) => ({
  achievementsInAchievement: {
    usersViaUserAchievements: r.many.usersInAuth({
      alias: "achievements_id_users_id_via_userAchievements",
      from: r.achievementsInAchievement.id.through(r.userAchievementsInAchievement.achievementId),
      to: r.usersInAuth.id.through(r.userAchievementsInAchievement.userId),
    }),
  },
}));
