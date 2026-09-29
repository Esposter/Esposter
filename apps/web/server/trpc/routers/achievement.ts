import type { PointsLeaderboard } from "#shared/models/achievement/PointsLeaderboard";
import type { UserAchievementInAchievementWithRelations } from "@esposter/db-schema";

import { readUserAchievementsInputSchema } from "#shared/models/db/achievement/ReadUserAchievementsInput";
import { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import { HIDDEN_ACHIEVEMENT_DESCRIPTION } from "#shared/services/achievement/constants";
import { achievementPointsSummation } from "@@/server/services/achievement/achievementPointsSummation";
import { buildPointsLeaderboard } from "@@/server/services/achievement/buildPointsLeaderboard";
import { achievementEventEmitter } from "@@/server/services/achievement/events/achievementEventEmitter";
import { on } from "@@/server/services/events/on";
import { router } from "@@/server/trpc";
import { standardAuthedProcedure } from "@@/server/trpc/procedure/standardAuthedProcedure";
import { standardRateLimitedProcedure } from "@@/server/trpc/procedure/standardRateLimitedProcedure";
import {
  achievementsInAchievement,
  UserAchievementInAchievementRelations,
  userAchievementsInAchievement,
  usersInAuth,
} from "@esposter/db-schema";
import { TRPCError } from "@trpc/server";
import { count, eq, isNotNull } from "drizzle-orm";

export const achievementRouter = router({
  onUpdateAchievement: standardAuthedProcedure.subscription(async function* ({ ctx, signal }) {
    for await (const [data] of on(achievementEventEmitter, "updateAchievement", { signal })) {
      const updatedUserAchievements = data.filter(({ userId }) => userId === ctx.getSessionPayload.user.id);
      if (updatedUserAchievements.length > 0) yield updatedUserAchievements;
    }
  }),
  readAchievementMap: standardAuthedProcedure.query<typeof AchievementDefinitionMap>(async ({ ctx }) => {
    const userId = ctx.getSessionPayload.user.id;
    const unlockedUserAchievements = await ctx.db.query.userAchievementsInAchievement.findMany({
      where: { unlockedAt: { isNotNull: true }, userId: { eq: userId } },
      with: UserAchievementInAchievementRelations,
    });
    const unlockedUserAchievementNames = new Set(unlockedUserAchievements.map(({ achievement }) => achievement.name));
    return Object.fromEntries(
      Object.entries(AchievementDefinitionMap).map(([achievementName, achievementDefinition]) => [
        achievementName,
        {
          ...achievementDefinition,
          description:
            achievementDefinition.isHidden && !unlockedUserAchievementNames.has(achievementName)
              ? HIDDEN_ACHIEVEMENT_DESCRIPTION
              : achievementDefinition.description,
        },
      ]),
    ) as typeof AchievementDefinitionMap;
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
      const sessionUserId = ctx.getSessionPayload?.user.id;
      const userId = input ?? sessionUserId;
      if (!userId) throw new TRPCError({ code: "UNAUTHORIZED" });
      // The endpoint is deliberately public (docs/user/public-profile.md), so anyone may ask for anyone's
      // Achievements — but only the unlocked ones. A locked row names a hidden achievement the viewer has not
      // Earned, and an in-progress row publishes how far along someone is; the public profile renders neither,
      // So the filter belongs here rather than in the one surface that currently happens to drop them
      return ctx.db.query.userAchievementsInAchievement.findMany({
        where: { ...(userId !== sessionUserId && { unlockedAt: { isNotNull: true } }), userId: { eq: userId } },
        with: UserAchievementInAchievementRelations,
      });
    }),
});
