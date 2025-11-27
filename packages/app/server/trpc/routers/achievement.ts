import type { AchievementDefinition } from "@@/server/models/achievement/AchievementDefinition";
import type { Achievement, UserAchievement } from "@esposter/db-schema";

import { achievementDefinitions } from "@@/server/services/achievement/achievementDefinitions";
import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { on } from "@@/server/services/events/on";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { achievements, selectUserSchema, UserAchievementRelations, userAchievements } from "@esposter/db-schema";
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
      if (data.userId === ctx.session.user.id) yield data;
  }),
  readAchievements: standardRateLimitedProcedure.query(() => achievementDefinitions.filter((a) => !a.isHidden)),
  readAllAchievements: standardAuthedProcedure.query(() => achievementDefinitions),
  readUserAchievements: standardRateLimitedProcedure
    .input(readUserAchievementsInputSchema)
    .query(async ({ ctx, input }) => {
      const userId = input ?? ctx.session?.user.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const userAchievements = await ctx.db.query.userAchievements.findMany({
        where: (userAchievements, { eq }) => eq(userAchievements.userId, userId),
        with: UserAchievementRelations,
      });
      const resultUserAchievements: (UserAchievement & { achievement: Achievement & AchievementDefinition })[] = [];
      for (const userAchievement of userAchievements) {
        const achievementDefinition = achievementDefinitions.find(
          ({ name }) => name === userAchievement.achievement.name,
        );
        if (!achievementDefinition) continue;
        resultUserAchievements.push({
          ...userAchievement,
          achievement: { ...userAchievement.achievement, ...achievementDefinition },
        });
      }
      return resultUserAchievements;
    }),
  readUserStats: standardRateLimitedProcedure.input(readUserStatsInputSchema).query(async ({ ctx, input }) => {
    const userId = input ?? ctx.session?.user.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    const totalAchievements = achievementDefinitions.length;
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
