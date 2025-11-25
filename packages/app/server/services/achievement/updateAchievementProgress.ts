import type { Database } from "@@/server/trpc/context";
import type { Achievement, UserAchievement } from "@esposter/db-schema";

import { getOrCreateUserAchievement } from "@@/server/services/achievement/getOrCreateUserAchievement";
import { userAchievements } from "@esposter/db-schema";
import { eq } from "drizzle-orm";

export const updateAchievementProgress = async (
  db: Database,
  userId: string,
  achievement: Achievement,
  increment: number,
): Promise<null | UserAchievement> => {
  if (increment <= 0) return null;
  const userAchievement = await getOrCreateUserAchievement(db, userId, achievement.id);
  if (userAchievement.unlockedAt) return null;
  const newProgress = (userAchievement.points ?? 0) + increment;
  const targetProgress = achievement.targetProgress ?? 1;
  const isUnlocked = newProgress >= targetProgress;
  const [updated] = await db
    .update(userAchievements)
    .set({
      points: newProgress,
      unlockedAt: isUnlocked ? new Date() : undefined,
    })
    .where(eq(userAchievements.id, userAchievement.id))
    .returning();
  return updated ?? null;
};
