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
