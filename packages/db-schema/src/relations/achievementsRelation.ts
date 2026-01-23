import { schema } from "@/schema";
import { defineRelationsPart } from "drizzle-orm";

export const achievementsRelation = defineRelationsPart(schema, (r) => ({
  achievements: {
    users: r.many.users({
      from: r.achievements.id.through(r.userAchievements.achievementId),
      to: r.users.id.through(r.userAchievements.userId),
    }),
  },
}));
