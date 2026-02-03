import type { Session } from "#shared/models/auth/Session";
import type { Context } from "@@/server/trpc/context";
import type { UserAchievementWithRelations } from "@esposter/db-schema";

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
  const updatedUserAchievements: UserAchievementWithRelations[] = [];

  for (const { amount = 1, condition, incrementAmount = 1, name } of achievementDefinitions.filter(
    ({ triggerPath }) => triggerPath === path,
  )) {
    if (condition && !checkAchievementCondition(condition, result.data)) continue;

    const achievement =
      (await ctx.db.query.achievements.findFirst({
        where: {
          name: {
            eq: name,
          },
        },
      })) ?? (await ctx.db.insert(achievements).values({ name }).returning())[0];
    if (!achievement)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Create, DatabaseEntityType.Achievement, name).message,
      });

    let newAmount = incrementAmount;
    let userAchievement = await ctx.db.query.userAchievements.findFirst({
      where: {
        achievementId: {
          eq: achievement.id,
        },
        userId: {
          eq: userId,
        },
      },
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
      )[0];
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
    )[0];
    if (!updatedUserAchievement)
      throw new TRPCError({
        code: "BAD_REQUEST",
        message: new InvalidOperationError(Operation.Update, DatabaseEntityType.UserAchievement, name).message,
      });

    updatedUserAchievements.push({ ...updatedUserAchievement, achievement });
  }

  if (updatedUserAchievements.length > 0) achievementEventEmitter.emit("updateAchievement", updatedUserAchievements);

  return result;
});
