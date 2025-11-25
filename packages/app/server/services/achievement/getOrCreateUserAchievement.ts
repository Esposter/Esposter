import type { Database } from "@@/server/trpc/context";
import type { UserAchievement } from "@esposter/db-schema";

import { userAchievements } from "@esposter/db-schema";

export const getOrCreateUserAchievement = async (
  db: Database,
  userId: string,
  achievementId: string,
): Promise<UserAchievement> => {
  const userAchievement = await db.query.userAchievements.findFirst({
    where: (userAchievements, { and, eq }) =>
      and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)),
  });
  if (userAchievement) return userAchievement;
  const [created] = await db.insert(userAchievements).values({ achievementId, userId }).returning();
  return created;
};
