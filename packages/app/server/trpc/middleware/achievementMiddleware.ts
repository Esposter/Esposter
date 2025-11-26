import type { AchievementCondition } from "@@/server/models/achievement/AchievementCondition";

import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { getAchievementDefinitionsByTriggerPath } from "@@/server/services/achievement/getAchievementDefinitionsByTriggerPath";
import { middleware } from "@@/server/trpc";
import { BinaryOperator, userAchievements } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

const checkCondition = (condition: AchievementCondition, eventData: any): boolean => {
  switch (condition.type) {
    case "or":
      return condition.conditions.some((c) => checkCondition(c, eventData));
    case "property": {
      const value = condition.path.split(".").reduce((o, i) => o?.[i], eventData);
      switch (condition.operator) {
        case BinaryOperator.eq:
          return value === condition.value;
        case BinaryOperator.ge:
          return value >= condition.value;
        case BinaryOperator.gt:
          return value > condition.value;
        case BinaryOperator.le:
          return value <= condition.value;
        case BinaryOperator.lt:
          return value < condition.value;
        case "contains":
          return typeof value === "string" && value.toLowerCase().includes(condition.value.toLowerCase());
        default:
          return false;
      }
    }
    case "and":
      return condition.conditions.every((c) => checkCondition(c, eventData));
    case "time": {
      const hour = new Date().getHours();
      return hour >= condition.startHour && hour < condition.endHour;
    }
    default:
      return false;
  }
};

export const achievementMiddleware = middleware(async ({ ctx, next, path, type }) => {
  const result = await next();
  if (type === "mutation" && ctx.session?.user?.id)
    try {
      const userId = ctx.session.user.id;
      const eventData = {
        input: ctx.rawInput,
        result: result.data,
      };

      const definitions = getAchievementDefinitionsByTriggerPath(path);

      for (const definition of definitions) {
        if (definition.conditions && !checkCondition(definition.conditions, eventData)) continue;

        const increment = definition.incrementAmount ?? 1;

        const achievement = await ctx.db.query.achievements.findFirst({
          where: (achievements, { eq }) => eq(achievements.name, definition.name),
        });

        if (!achievement) continue;

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
          const targetProgress = definition.amount ?? 1;
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
              achievement: { ...achievement, ...definition },
              userId: ctx.session.user.id,
            });
        }
      }
    } catch (error) {
      console.error("Achievement error:", error);
    }
  return result;
});
