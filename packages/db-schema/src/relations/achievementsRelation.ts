import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const achievementsRelation = defineRelationsPart(schema, (r) => ({
  achievements: {
    usersViaUserAchievements: r.many.users({
      alias: "achievements_id_users_id_via_userAchievements",
      from: r.achievements.id.through(r.userAchievements.achievementId),
      to: r.users.id.through(r.userAchievements.userId),
    }),
  },
}));
