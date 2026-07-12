import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { UserAchievementWithRelations } from "@esposter/db-schema";

import { achievementDefinitions } from "#shared/services/achievement/achievementDefinitions";
import { checkAchievementCondition } from "@@/server/services/achievement/checkAchievementCondition";
import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { achievements, DatabaseEntityType, userAchievements } from "@esposter/db-schema";
import { getResultAsync, noop, Operation } from "@esposter/shared";
import { initTRPC } from "@trpc/server";
import { and, eq } from "drizzle-orm";

const t = initTRPC.context<AuthedContext>().create();

// Achievement processing is best-effort: the mutation already committed by the time we run,
// So a failure here must never reject the call — log it and return the original result.
export const achievementPlugin = t.procedure.use(async ({ ctx, getRawInput, next, path, type }) => {
  const result = await next();
  if (!result.ok || type !== "mutation") return result;

  const userId = ctx.getSessionPayload.user.id;

  await getResultAsync(async () => {
    const rawInput = await getRawInput();
    const updatedUserAchievements: UserAchievementWithRelations[] = [];

    for (const { amount = 1, condition, incrementAmount = 1, name } of achievementDefinitions.filter(
      ({ triggerPath }) => triggerPath === path,
    ))
      await getResultAsync(async () => {
        if (condition && !checkAchievementCondition(condition, rawInput)) return;

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
        else if (userAchievement.unlockedAt) return;
        else newAmount += userAchievement.amount;

        const updatedUserAchievement = requireMutation(
          (
            await ctx.db
              .update(userAchievements)
              .set({
                amount: newAmount,
                unlockedAt: newAmount >= amount ? new Date() : undefined,
              })
              .where(
                and(
                  eq(userAchievements.userId, userAchievement.userId),
                  eq(userAchievements.achievementId, userAchievement.achievementId),
                ),
              )
              .returning()
          )[0],
          Operation.Update,
          DatabaseEntityType.UserAchievement,
          name,
        );

        updatedUserAchievements.push({ ...updatedUserAchievement, achievement });
      }).match(noop, (error) => {
        console.error(`Failed to process achievement "${name}" for path "${path}" and user "${userId}":`, error);
      });

    if (updatedUserAchievements.length > 0) achievementEventEmitter.emit("updateAchievement", updatedUserAchievements);
  }).match(noop, (error) => {
    console.error(`Failed to process achievements for path "${path}" and user "${userId}":`, error);
  });

  return result;
});
