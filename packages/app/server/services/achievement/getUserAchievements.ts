import type { Database } from "@@/server/trpc/context";
import type { Achievement, UserAchievement } from "@esposter/db-schema";

export const getUserAchievements = (
  db: Database,
  userId: string,
): Promise<(UserAchievement & { achievement: Achievement })[]> =>
  db.query.userAchievements.findMany({
    where: (userAchievements, { eq }) => eq(userAchievements.userId, userId),
    with: { achievement: true },
  });
