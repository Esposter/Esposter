import type { Database } from "@@/server/trpc/context";

import { achievements, userAchievements } from "@esposter/db-schema";
import { and, eq, isNotNull } from "drizzle-orm";

export const getUserAchievementStats = async (
  db: Database,
  userId: string,
): Promise<{
  totalAchievements: number;
  totalPoints: number;
  unlockedAchievements: number;
  unlockedPoints: number;
}> => {
  const allAchievements = await db.select().from(achievements);
  const userAchievementsList = await db
    .select()
    .from(userAchievements)
    .leftJoin(achievements, eq(userAchievements.achievementId, achievements.id))
    .where(and(eq(userAchievements.userId, userId), isNotNull(userAchievements.unlockedAt)));
  const unlockedIds = new Set(
    userAchievementsList.map(
      (ua: { user_achievements: { achievementId: string } }) => ua.user_achievements.achievementId,
    ),
  );
  const unlocked = allAchievements.filter((a: { id: string }) => unlockedIds.has(a.id));
  return {
    totalAchievements: allAchievements.length,
    totalPoints: allAchievements.reduce((sum: number, a: { points: number }) => sum + a.points, 0),
    unlockedAchievements: unlocked.length,
    unlockedPoints: unlocked.reduce((sum: number, a: { points: number }) => sum + a.points, 0),
  };
};
