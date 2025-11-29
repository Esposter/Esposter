import { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";
import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { on } from "@@/server/services/events/on";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { achievements, selectUserSchema, userAchievements } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";

const readUserAchievementsInputSchema = selectUserSchema.shape.id.optional();
export type ReadUserAchievementsInput = z.infer<typeof readUserAchievementsInputSchema>;

export const achievementRouter = router({
  onUpdateAchievement: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    for await (const [data] of on(achievementEventEmitter, "updateAchievement", { signal }))
      if (data.userId === ctx.session.user.id) yield data;
  }),
  readAchievementMap: standardAuthedProcedure.query(async ({ ctx }) => {
    const userId = ctx.session.user.id;
    const unlockedUserAchievementNames = await ctx.db
      .select({ name: achievements.name })
      .from(userAchievements)
      .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
      .where(and(eq(userAchievements.userId, userId), isNull(userAchievements.unlockedAt)));
    return Object.fromEntries(
      Object.entries(AchievementDefinitionMap).map(([achievementName, achievementDefinition]) => [
        achievementName,
        {
          ...achievementDefinition,
          description:
            achievementDefinition.isHidden && !unlockedUserAchievementNames.some(({ name }) => name === achievementName)
              ? "???"
              : achievementDefinition.description,
        },
      ]),
    ) as typeof AchievementDefinitionMap;
  }),
  readUserAchievements: standardRateLimitedProcedure
    .input(readUserAchievementsInputSchema)
    .query(async ({ ctx, input }) => {
      const userId = input ?? ctx.session?.user.id;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

      const joinedUserAchievements = await ctx.db
        .select()
        .from(userAchievements)
        .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
        .where(and(eq(userAchievements.userId, userId)));
      return joinedUserAchievements.map(({ achievements, user_achievements }) => ({
        ...user_achievements,
        achievement: achievements,
      }));
    }),
});
