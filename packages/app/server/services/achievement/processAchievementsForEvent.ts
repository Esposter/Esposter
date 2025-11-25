import type { Database } from "@@/server/trpc/context";
import type { UserAchievement } from "@esposter/db-schema";

import { achievementDefinitions } from "@@/server/services/achievement/achievementDefinitions";
import { updateAchievementProgress } from "@@/server/services/achievement/updateAchievementProgress";

export const processAchievementsForEvent = async (
  db: Database,
  userId: string,
  eventType: string,
  eventData: unknown,
): Promise<UserAchievement[]> => {
  const unlockedAchievements: UserAchievement[] = [];
  const relevantAchievements = await db.query.achievements.findMany({
    where: (achievements, { sql }) => sql`${achievements.metadata}->>'eventType' = ${eventType}`,
  });
  for (const achievement of relevantAchievements) {
    const definition = achievementDefinitions.find((def) => def.name === achievement.name);
    if (!definition) continue;
    const increment = definition.checkCriteria(eventData);
    if (increment <= 0) continue;
    const updated = await updateAchievementProgress(db, userId, achievement, increment);
    if (updated?.unlockedAt) unlockedAchievements.push(updated);
  }
  return unlockedAchievements;
};
