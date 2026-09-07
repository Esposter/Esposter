import type { AuthedContext } from "@@/server/models/auth/AuthedContext";
import type { UserAchievementWithRelations } from "@esposter/db-schema";

import { achievementDefinitions } from "#shared/services/achievement/achievementDefinitions";
import { checkAchievementCondition } from "@@/server/services/achievement/checkAchievementCondition";
import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { requireMutation } from "@@/server/trpc/guards/requireMutation";
import { achievements, DatabaseEntityType, userAchievements } from "@esposter/db-schema";
import { getResultAsync, noop, Operation } from "@esposter/shared";
import { initTRPC } from "@trpc/server";
import { isNull, sql } from "drizzle-orm";

const t = initTRPC.context<AuthedContext>().create();

// Best-effort: a failure here loses one unlock, never the mutation that has already committed.
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
        // Upserted rather than read-then-inserted: concurrent mutations both miss the row and race to insert.
        // The no-op set is what makes RETURNING yield the existing row on conflict
        const achievement = requireMutation(
          (
            await ctx.db
              .insert(achievements)
              .values({ name })
              .onConflictDoUpdate({ set: { name }, target: achievements.name })
              .returning()
          )[0],
          Operation.Create,
          DatabaseEntityType.Achievement,
          name,
        );
        // The increment is done in SQL so concurrent mutations each claim a distinct amount instead of
        // Overwriting one another with a read-then-write. setWhere freezes an already unlocked achievement,
        // And its empty RETURNING is the short-circuit that keeps a completed achievement from re-emitting
        const [userAchievement] = await ctx.db
          .insert(userAchievements)
          .values({
            achievementId: achievement.id,
            amount: incrementAmount,
            unlockedAt: incrementAmount >= amount ? new Date() : undefined,
            userId,
          })
          .onConflictDoUpdate({
            set: {
              amount: sql`${userAchievements.amount} + ${incrementAmount}`,
              unlockedAt: sql`CASE WHEN ${userAchievements.amount} + ${incrementAmount} >= ${amount} THEN NOW() ELSE NULL END`,
            },
            setWhere: isNull(userAchievements.unlockedAt),
            target: [userAchievements.userId, userAchievements.achievementId],
          })
          .returning();
        if (!userAchievement) return;

        updatedUserAchievements.push({ ...userAchievement, achievement });
      }).match(noop, (error) => {
        console.error(`Failed to process achievement "${name}" for path "${path}" and user "${userId}":`, error);
      });

    if (updatedUserAchievements.length > 0) achievementEventEmitter.emit("updateAchievement", updatedUserAchievements);
  }).match(noop, (error) => {
    console.error(`Failed to process achievements for path "${path}" and user "${userId}":`, error);
  });

  return result;
});
