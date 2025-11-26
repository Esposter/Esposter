import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { on } from "@@/server/services/events/on";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { achievements, selectUserSchema, userAchievements } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { and, count, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";

const readUserAchievementsInputSchema = selectUserSchema.shape.id.optional();
export type ReadUserAchievementsInput = z.infer<typeof readUserAchievementsInputSchema>;

const readUserStatsInputSchema = selectUserSchema.shape.id.optional();
export type ReadUserStatsInput = z.infer<typeof readUserStatsInputSchema>;

export const achievementRouter = router({
  onUnlockAchievement: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    for await (const [data] of on(achievementEventEmitter, "unlockAchievement", { signal }))
      if (data.userId === ctx.session.user.id)
        yield {
          achievement: data.achievement,
          userAchievement: data,
        };
  }),
  readAchievements: standardRateLimitedProcedure.query(({ ctx }) =>
    ctx.db.query.achievements.findMany({
      where: (achievements, { eq }) => eq(achievements.isHidden, false),
    }),
  ),
  readAllAchievements: standardAuthedProcedure.query(({ ctx }) => ctx.db.query.achievements.findMany()),
  readUserAchievements: standardRateLimitedProcedure.input(readUserAchievementsInputSchema).query(({ ctx, input }) => {
    const userId = input ?? ctx.session?.user.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    return ctx.db.query.userAchievements.findMany({
      where: (userAchievements, { eq }) => eq(userAchievements.userId, userId),
      with: { achievement: true },
    });
  }),
  readUserStats: standardRateLimitedProcedure.input(readUserStatsInputSchema).query(async ({ ctx, input }) => {
    const userId = input ?? ctx.session?.user.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const totalAchievements = (await ctx.db.select({ count: count() }).from(achievements))[0].count;
    const unlockedAchievements = (
      await ctx.db
        .select({ count: count() })
        .from(userAchievements)
        .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
        .where(and(eq(userAchievements.userId, userId), isNotNull(userAchievements.unlockedAt)))
    )[0].count;
    return {
      totalAchievements,
      unlockedAchievements,
    };
  }),
});
