import { AchievementDefinitionMap } from "#shared/services/achievement/AchievementDefinitionMap";
import { achievements } from "@esposter/db-schema";
import { sql } from "drizzle-orm";

// Points live in the definition map, not the DB, so the summation injects them as a CASE over the
// Achievement name — keeping the aggregation in SQL bounds the result set to one row per user.
export const achievementPointsSummation = sql<number>`sum(case ${achievements.name} ${sql.join(
  Object.entries(AchievementDefinitionMap).map(
    ([achievementName, { points }]) => sql`when ${achievementName} then ${points}`,
  ),
  sql` `,
)} else 0 end)::int`;
