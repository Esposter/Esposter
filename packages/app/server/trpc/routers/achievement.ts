import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { getUserAchievements } from "@@/server/services/achievement/getUserAchievements";
import { getUserAchievementStats } from "@@/server/services/achievement/getUserAchievementStats";
import { on } from "@@/server/services/events/on";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { selectUserSchema } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
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
    return getUserAchievements(ctx.db, userId);
  }),
  readUserStats: standardRateLimitedProcedure.input(readUserStatsInputSchema).query(({ ctx, input }) => {
    const userId = input ?? ctx.session?.user.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
    return getUserAchievementStats(ctx.db, userId);
  }),
});
