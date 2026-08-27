import type { PointsLeaderboard } from "#shared/models/achievement/PointsLeaderboard";
import type { UserAchievementWithRelations } from "@esposter/db-schema";

import { AchievementDefinitionMap } from "#shared/services/achievement/achievementDefinitions";
import { buildPointsLeaderboard } from "@@/server/services/achievement/buildPointsLeaderboard";
import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { on } from "@@/server/services/events/on";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import { achievements, selectUserSchema, UserAchievementRelations, userAchievements, users } from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { count, eq, isNotNull, sql } from "drizzle-orm";

const readUserAchievementsInputSchema = selectUserSchema.shape.id.optional();
// Points live in the definition map, not the DB, so the summation injects them as a CASE over the
// Achievement name — keeping the aggregation in SQL bounds the result set to one row per user.
const achievementPointsSum = sql<number>`sum(case ${achievements.name} ${sql.join(
  Object.entries(AchievementDefinitionMap).map(
    ([achievementName, { points }]) => sql`when ${achievementName} then ${points}`,
  ),
  sql` `,
)} else 0 end)::int`;

export const achievementRouter = router({
  onUpdateAchievement: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    for await (const [data] of on(achievementEventEmitter, "updateAchievement", { signal })) {
      const updatedUserAchievements = data.filter(({ userId }) => userId === ctx.getSessionPayload.user.id);
      if (updatedUserAchievements.length > 0) yield updatedUserAchievements;
    }
  }),
  readAchievementMap: standardAuthedProcedure.query<typeof AchievementDefinitionMap>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const unlockedUserAchievements = await ctx.db.query.userAchievements.findMany({
      where: { unlockedAt: { isNotNull: true }, userId: { eq: userId } },
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
  readPointsLeaderboard: standardRateLimitedProcedure.query<PointsLeaderboard>(async ({ ctx }) => {
    const userTotals = await ctx.db
      .select({
        points: achievementPointsSum,
        unlockCount: count(),
        user: { id: users.id, image: users.image, name: users.name },
      })
      .from(userAchievements)
      .innerJoin(achievements, eq(achievements.id, userAchievements.achievementId))
      .innerJoin(users, eq(users.id, userAchievements.userId))
      .where(isNotNull(userAchievements.unlockedAt))
      .groupBy(users.id);
    return buildPointsLeaderboard(userTotals, ctx.getSessionPayload?.user.id);
  }),
  readUserAchievements: standardRateLimitedProcedure
    .input(readUserAchievementsInputSchema)
    .query<UserAchievementWithRelations[]>(({ ctx, input }) => {
      const sessionUserId = ctx.getSessionPayload?.user.id;
      const userId = input ?? sessionUserId;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      // The endpoint is deliberately public (docs/users/public-profile.md), so anyone may ask for anyone's
      // Achievements — but only the unlocked ones. A locked row names a hidden achievement the viewer has not
      // Earned, and an in-progress row publishes how far along someone is; the public profile renders neither,
      // So the filter belongs here rather than in the one surface that currently happens to drop them
      return ctx.db.query.userAchievements.findMany({
        where: { ...(userId !== sessionUserId && { unlockedAt: { isNotNull: true } }), userId: { eq: userId } },
        with: UserAchievementRelations,
      });
    }),
});
