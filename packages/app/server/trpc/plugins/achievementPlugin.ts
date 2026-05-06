import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { UserAchievementWithRelations } from "@esposter/db-schema";

import { achievementDefinitions } from "#shared/services/achievement/achievementDefinitions";
import { checkAchievementCondition } from "@@/server/services/achievement/checkAchievementCondition";
import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { achievements, DatabaseEntityType, userAchievements } from "@esposter/db-schema";
import { Operation } from "@esposter/shared";
import { initTRPC } from "@trpc/server";
import { eq } from "drizzle-orm";

const t = initTRPC.context<AuthedContext>().create();

export const achievementPlugin = t.procedure.use(async ({ ctx, getRawInput, next, path, type }) => {
  const result = await next();
  if (!result.ok || type !== "mutation") return result;

  const rawInput = await getRawInput();
  const userId = ctx.getSessionPayload.user.id;
  const updatedUserAchievements: UserAchievementWithRelations[] = [];

  for (const { amount = 1, condition, incrementAmount = 1, name } of achievementDefinitions.filter(
    ({ triggerPath }) => triggerPath === path,
  )) {
    if (condition && !checkAchievementCondition(condition, rawInput)) continue;

    const achievement = requireMutation(
      (await ctx.db.query.achievements.findFirst({
        where: {
          name: {
            eq: name,
          },
        },
      })) ?? (await ctx.db.insert(achievements).values({ name }).returning())[0],
      Operation.Create,
      DatabaseEntityType.Achievement,
      name,
    );
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
    if (!userAchievement)
      userAchievement = requireMutation(
        (
          await ctx.db
            .insert(userAchievements)
            .values({
              achievementId: achievement.id,
              amount: newAmount,
              unlockedAt: newAmount >= amount ? new Date() : undefined,
              userId,
            })
            .returning()
        )[0],
        Operation.Create,
        DatabaseEntityType.UserAchievement,
        JSON.stringify({
          achievementId: achievement.id,
          amount: incrementAmount,
          userId,
        }),
      );
    else if (userAchievement.unlockedAt) continue;
    else newAmount += userAchievement.amount;

    const updatedUserAchievement = requireMutation(
      (
        await ctx.db
          .update(userAchievements)
          .set({
            amount: newAmount,
            unlockedAt: newAmount >= amount ? new Date() : undefined,
          })
          .where(eq(userAchievements.id, userAchievement.id))
          .returning()
      )[0],
      Operation.Update,
      DatabaseEntityType.UserAchievement,
      name,
    );

    updatedUserAchievements.push({ ...updatedUserAchievement, achievement });
  }

  if (updatedUserAchievements.length > 0) achievementEventEmitter.emit("updateAchievement", updatedUserAchievements);

  return result;
});
