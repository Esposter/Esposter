import { achievementDefinitions } from "@@/server/services/achievement/achievementDefinitions";
import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { middleware } from "@@/server/trpc";
import { userAchievements } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

export const achievementMiddleware = middleware(async ({ ctx, next, path, type }) => {
  const result = await next();
  if (type === "mutation" && ctx.session?.user?.id)
    try {
      const userId = ctx.session.user.id;
      const eventType = path;
      const eventData = {
        input: ctx.rawInput,
        result: result.data,
      };

      const relevantAchievements = await ctx.db.query.achievements.findMany({
        where: (achievements, { sql }) => sql`${achievements.metadata}->>'eventType' = ${eventType}`,
      });

      for (const achievement of relevantAchievements) {
        const definition = achievementDefinitions.find((def) => def.name === achievement.name);
        if (!definition) continue;
        const increment = definition.checkCriteria(eventData);
        if (increment <= 0) continue;

        // updateAchievementProgress logic
        let userAchievement = await ctx.db.query.userAchievements.findFirst({
          where: (userAchievements, { and, eq }) =>
            and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievement.id)),
        });

        if (!userAchievement)
          [userAchievement] = await ctx.db
            .insert(userAchievements)
            .values({ achievementId: achievement.id, userId })
            .returning();

        if (userAchievement && !userAchievement.unlockedAt) {
          const newProgress = (userAchievement.points ?? 0) + increment;
          const targetProgress = achievement.targetProgress ?? 1;
          const isUnlocked = newProgress >= targetProgress;
          const [updated] = await ctx.db
            .update(userAchievements)
            .set({
              points: newProgress,
              unlockedAt: isUnlocked ? new Date() : undefined,
            })
            .where(eq(userAchievements.id, userAchievement.id))
            .returning();

          if (updated?.unlockedAt)
            achievementEventEmitter.emit("unlockAchievement", {
              ...updated,
              achievement,
              userId: ctx.session.user.id,
            });
        }
      }
    } catch (error) {
      console.error("Achievement error:", error);
    }
  return result;
});
