import type { AchievementDefinitionViewMap } from "#shared/models/achievement/AchievementDefinitionViewMap";
import type { PointsLeaderboard } from "#shared/models/achievement/PointsLeaderboard";
import type { AchievementName, UserAchievementInAchievementWithRelations } from "@esposter/db-schema";

import { achievementPointsSummation } from "#server/services/achievement/achievementPointsSummation";
import { buildPointsLeaderboard } from "#server/services/achievement/buildPointsLeaderboard";
import { achievementEventEmitter } from "#server/services/achievement/events/achievementEventEmitter";
import { on } from "#server/services/events/on";
import { router } from "#server/trpc";
import { standardAuthedProcedure } from "#server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "#server/trpc/procedure/standardRateLimitedProcedure";
import { readUserAchievementsInputSchema } from "#shared/models/db/achievement/ReadUserAchievementsInput";
import { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import { achievementDefinitions } from "#shared/services/achievement/achievementDefinitions";
import { HIDDEN_ACHIEVEMENT_DESCRIPTION } from "#shared/services/achievement/constants";
import {
  achievementsInAchievement,
  UserAchievementInAchievementRelations,
  userAchievementsInAchievement,
  usersInAuth,
} from "@esposter/db-schema";
import { takeOne } from "@esposter/shared";
import { TRPCError } from "@trpc/server";
import { count, eq, isNotNull } from "drizzle-orm";

export const achievementRouter = router({
  onUpdateAchievement: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    for await (const [data] of on(achievementEventEmitter, "updateAchievement", { signal })) {
      const updatedUserAchievements = data.filter(({ userId }) => userId === ctx.getSessionPayload.user.id);
      if (updatedUserAchievements.length > 0) yield updatedUserAchievements;
    }
  }),
  readAchievementMap: standardAuthedProcedure.query<AchievementDefinitionViewMap>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const unlockedUserAchievements = await ctx.db.query.userAchievementsInAchievement.findMany({
      where: { unlockedAt: { isNotNull: true }, userId: { eq: userId } },
      with: UserAchievementInAchievementRelations,
    });
    // The trigger's zod schema and the predicates are server-only, and the schema's cycles cannot be sent as JSON, so
    // The map ships its client fields alone
    return Object.fromEntries(
      Object.entries(AchievementDefinitionMap).map(
        ([
          achievementName,
          { check: _check, condition: _condition, inputSchema: _inputSchema, ...achievementDefinition },
        ]) => [
          achievementName,
          {
            ...achievementDefinition,
            description:
              achievementDefinition.isHidden &&
              !unlockedUserAchievements.some(({ achievement }) => achievement.name === achievementName)
                ? HIDDEN_ACHIEVEMENT_DESCRIPTION
                : achievementDefinition.description,
          },
        ],
      ),
    );
  }),
  // The share of registered users who have unlocked each achievement, as a percentage. Every definition is keyed, so
  // One nobody has earned reads 0 rather than being absent
  readAchievementRarities: standardRateLimitedProcedure.query<Record<AchievementName, number>>(async ({ ctx }) => {
    const { totalUsers } = takeOne(await ctx.db.select({ totalUsers: count() }).from(usersInAuth));
    const unlockCounts = await ctx.db
      .select({ achievementName: achievementsInAchievement.name, unlockCount: count() })
      .from(userAchievementsInAchievement)
      .innerJoin(
        achievementsInAchievement,
        eq(achievementsInAchievement.id, userAchievementsInAchievement.achievementId),
      )
      .where(isNotNull(userAchievementsInAchievement.unlockedAt))
      .groupBy(achievementsInAchievement.name);
    const unlockCountMap = new Map(
      unlockCounts.map(({ achievementName, unlockCount }) => [achievementName, unlockCount]),
    );
    return Object.fromEntries(
      achievementDefinitions.map(({ name }) => [
        name,
        ((unlockCountMap.get(name) ?? 0) / Math.max(totalUsers, 1)) * 100,
      ]),
    );
  }),
  readPointsLeaderboard: standardRateLimitedProcedure.query<PointsLeaderboard>(async ({ ctx }) => {
    const userTotals = await ctx.db
      .select({
        points: achievementPointsSummation,
        unlockCount: count(),
        user: { id: usersInAuth.id, image: usersInAuth.image, name: usersInAuth.name },
      })
      .from(userAchievementsInAchievement)
      .innerJoin(
        achievementsInAchievement,
        eq(achievementsInAchievement.id, userAchievementsInAchievement.achievementId),
      )
      .innerJoin(usersInAuth, eq(usersInAuth.id, userAchievementsInAchievement.userId))
      .where(isNotNull(userAchievementsInAchievement.unlockedAt))
      .groupBy(usersInAuth.id);
    return buildPointsLeaderboard(userTotals, ctx.getSessionPayload?.user.id);
  }),
  readUserAchievements: standardRateLimitedProcedure
    .input(readUserAchievementsInputSchema)
    .query<UserAchievementInAchievementWithRelations[]>(({ ctx, input }) => {
      const userId = ctx.getSessionPayload?.user.id;
      const targetUserId = input ?? userId;
      if (!targetUserId) throw new TRPCError({ code: "UNAUTHORIZED" });
      // The endpoint is deliberately public (openspec/specs/user/public-profile/design.md), so anyone may ask
      // For anyone's Achievements — but only the unlocked ones. A locked row names a hidden achievement the viewer
      // Has not earned, and an in-progress row publishes how far along someone is; the public profile renders
      // Neither, so the filter belongs here rather than in the one surface that currently happens to drop them
      return ctx.db.query.userAchievementsInAchievement.findMany({
        where: { ...(targetUserId !== userId && { unlockedAt: { isNotNull: true } }), userId: { eq: targetUserId } },
        with: UserAchievementInAchievementRelations,
      });
    }),
});
