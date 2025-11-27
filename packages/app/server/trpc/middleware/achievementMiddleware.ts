import type { AchievementCondition } from "@@/server/models/achievement/AchievementCondition";

import { achievementDefinitions } from "@@/server/services/achievement/achievementDefinitions";
import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { middleware } from "@@/server/trpc";
import { BinaryOperator, DatabaseEntityType, UnaryOperator, userAchievements } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

const checkCondition = (condition: AchievementCondition, eventData: unknown): boolean => {
  switch (condition.type) {
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
    case "time": {
      const { endHour, startHour } = condition;
      const currentHour = dayjs();
      return currentHour >= startHour || currentHour < endHour;
    }
    case UnaryOperator.and:
      return condition.conditions.every((c) => checkCondition(c, eventData));
    case UnaryOperator.or:
      return condition.conditions.some((c) => checkCondition(c, eventData));
    default:
      return false;
  }
};

export const achievementMiddleware = middleware(async ({ ctx, next, path, type }) => {
  const result = await next();
  if (type === "mutation" && ctx.session?.user?.id) {
    const userId = ctx.session.user.id;
    const eventData = result.data;

    for (const { amount = 1, conditions, incrementAmount = 1, name } of achievementDefinitions.filter(
      ({ triggerPath }) => triggerPath === path,
    )) {
      if (conditions && !checkCondition(conditions, eventData)) continue;

      const achievement = await ctx.db.query.achievements.findFirst({
        where: (achievements, { eq }) => eq(achievements.name, name),
      });
      if (!achievement) continue;

      const userAchievement =
        (await ctx.db.query.userAchievements.findFirst({
          where: (userAchievements, { and, eq }) =>
            and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievement.id)),
        })) ??
        (
          await ctx.db
            .insert(userAchievements)
            .values({ achievementId: achievement.id, amount: incrementAmount, userId })
            .returning()
        ).find(Boolean);
      if (!userAchievement)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Achievement, name).message,
        });
      else if (userAchievement.unlockedAt) continue;

      const newAmount = userAchievement.amount + incrementAmount;
      const updatedAchievement = (
        await ctx.db
          .update(userAchievements)
          .set({
            amount: newAmount,
            unlockedAt: newAmount >= amount ? new Date() : undefined,
          })
          .where(eq(userAchievements.id, userAchievement.id))
          .returning()
      ).find(Boolean);
      if (!updatedAchievement)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(Operation.Update, DatabaseEntityType.Achievement, name).message,
        });

      achievementEventEmitter.emit("unlockAchievement", updatedAchievement);
    }
  }
  return result;
});
