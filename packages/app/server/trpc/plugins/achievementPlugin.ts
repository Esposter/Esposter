import type { Session } from "#shared/models/auth/Session";
import type { Context } from "@@/server/trpc/context";

import { achievementDefinitions } from "#shared/services/achievement/achievementDefinitions";
import { checkAchievementCondition } from "@@/server/services/achievement/checkAchievementCondition";
import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { achievements, DatabaseEntityType, userAchievements } from "@esposter/db-schema";
import { InvalidOperationError, Operation } from "@esposter/shared";
import { initTRPC, TRPCError } from "@trpc/server";
import { eq } from "drizzle-orm";

const t = initTRPC.context<Context & { session: Session }>().create();

export const achievementPlugin = t.procedure.use(async ({ ctx, next, path, type }) => {
  const result = await next();
  if (!result.ok || type !== "mutation") return result;

  const userId = ctx.session.user.id;

  for (const { amount = 1, condition, incrementAmount = 1, name } of achievementDefinitions.filter(
    ({ triggerPath }) => triggerPath === path,
  )) {
    if (condition && !checkAchievementCondition(condition, result.data)) continue;

    const achievement =
      (await ctx.db.query.achievements.findFirst({
        where: (achievements, { eq }) => eq(achievements.name, name),
      })) ?? (await ctx.db.insert(achievements).values({ name }).returning()).find(Boolean);
    if (!achievement)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Achievement, name).message,
      });

    let newAmount = incrementAmount;
    let userAchievement = await ctx.db.query.userAchievements.findFirst({
      where: (userAchievements, { and, eq }) =>
        and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievement.id)),
    });
    if (!userAchievement) {
      userAchievement = (
        await ctx.db
          .insert(userAchievements)
          .values({
            achievementId: achievement.id,
            amount: newAmount,
            unlockedAt: newAmount >= amount ? new Date() : undefined,
            userId,
          })
          .returning()
      ).find(Boolean);
      if (!userAchievement)
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: new InvalidOperationError(
            Operation.Create,
            DatabaseEntityType.UserAchievement,
            JSON.stringify({
              achievementId: achievement.id,
              amount: incrementAmount,
              userId,
            }),
          ).message,
        });
    } else if (userAchievement.unlockedAt) continue;
    else newAmount += userAchievement.amount;

    const updatedUserAchievement = (
      await ctx.db
        .update(userAchievements)
        .set({
          amount: newAmount,
          unlockedAt: newAmount >= amount ? new Date() : undefined,
        })
        .where(eq(userAchievements.id, userAchievement.id))
        .returning()
    ).find(Boolean);
    if (!updatedUserAchievement)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Update, DatabaseEntityType.UserAchievement, name).message,
      });

    achievementEventEmitter.emit("updateAchievement", { ...updatedUserAchievement, achievement });
  }

  return result;
});
