import { AchievementDefinitionMap } from "@@/server/services/achievement/achievementDefinitions";
import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { on } from "@@/server/services/events/on";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { achievements, selectUserSchema, userAchievements } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";
import { z } from "zod";

const readUserAchievementsInputSchema = selectUserSchema.shape.id.optional();
export type ReadUserAchievementsInput = z.infer<typeof readUserAchievementsInputSchema>;

export const achievementRouter = router({
  onUnlockAchievement: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    for await (const [data] of on(achievementEventEmitter, "unlockAchievement", { signal }))
      if (data.userId === ctx.session.user.id) yield data;
  }),
  readAchievementMap: standardRateLimitedProcedure.query(() =>
    Object.fromEntries(Object.entries(AchievementDefinitionMap).filter(([, { isHidden }]) => !isHidden)),
  ),
  readAllAchievementMap: standardAuthedProcedure.query(() => AchievementDefinitionMap),
  readUserAchievements: standardRateLimitedProcedure.input(readUserAchievementsInputSchema).query(({ ctx, input }) => {
    const userId = input ?? ctx.session?.user.id;
    if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });

    return ctx.db
      .select()
      .from(userAchievements)
      .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
      .where(and(eq(userAchievements.userId, userId)));
  }),
});
