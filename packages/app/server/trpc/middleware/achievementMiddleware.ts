import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { processAchievementsForEvent } from "@@/server/services/achievement/processAchievementsForEvent";
import { middleware } from "@@/server/trpc";

export const achievementMiddleware = middleware(async ({ ctx, next, path, type }) => {
  const result = await next();
  if (type === "mutation" && ctx.session?.user?.id)
    try {
      const unlockedAchievements = await processAchievementsForEvent(ctx.db, ctx.session.user.id, path, {
        input: ctx.rawInput,
        result: result.data,
      });
      for (const userAchievement of unlockedAchievements) {
        const achievement = await ctx.db.query.achievements.findFirst({
          where: (achievements, { eq }) => eq(achievements.id, userAchievement.achievementId),
        });
        if (achievement)
          achievementEventEmitter.emit("unlockAchievement", {
            ...userAchievement,
            achievement,
            userId: ctx.session.user.id,
          });
      }
    } catch (error) {
      console.error("Achievement error:", error);
    }
  return result;
});
