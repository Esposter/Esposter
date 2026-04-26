import { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";
import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { on } from "@@/server/services/events/on";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { selectUserSchema, UserAchievementRelations } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

const readUserAchievementsInputSchema = selectUserSchema.shape.id.optional();
export type ReadUserAchievementsInput = z.infer<typeof readUserAchievementsInputSchema>;

export const achievementRouter = router({
  onUpdateAchievement: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    for await (const [data] of on(achievementEventEmitter, "updateAchievement", { signal })) {
      const userAchievements = data.filter(({ userId }) => userId === ctx.getSessionPayload.user.id);
      if (userAchievements.length > 0) yield userAchievements;
    }
  }),
  readAchievementMap: standardAuthedProcedure.query(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const unlockedUserAchievements = await ctx.db.query.userAchievements.findMany({
      where: {
        RAW: (userAchievements, { and, eq, isNotNull }) =>
          and(eq(userAchievements.userId, userId), isNotNull(userAchievements.unlockedAt)),
      },
      with: UserAchievementRelations,
    });
    const unlockedUserAchievementNames = new Set(unlockedUserAchievements.map(({ achievement }) => achievement.name));
    return Object.fromEntries(
      Object.entries(AchievementDefinitionMap).map(([achievementName, achievementDefinition]) => [
        achievementName,
        {
          ...achievementDefinition,
          description:
            achievementDefinition.isHidden && !unlockedUserAchievementNames.has(achievementName)
              ? "???"
              : achievementDefinition.description,
        },
      ]),
    ) as typeof AchievementDefinitionMap;
  }),
  readUserAchievements: standardRateLimitedProcedure.input(readUserAchievementsInputSchema).query(({ ctx, input }) => {
    const userId = input ?? ctx.getSessionPayload?.user.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
    return ctx.db.query.userAchievements.findMany({
      where: { userId: { eq: userId } },
      with: UserAchievementRelations,
    });
  }),
});
