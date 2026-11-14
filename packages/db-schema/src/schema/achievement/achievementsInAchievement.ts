import { achievementSchema } from "#src/schema/achievement/achievementSchema";
import { AchievementName } from "#src/services/achievement/AchievementName";
import { createEnumColumn } from "#src/services/shared/createEnumColumn";
import { sqliteTable } from "#src/sqliteTable";
import { text } from "drizzle-orm/sqlite-core";

export const achievementsInAchievement = sqliteTable(
  "achievements",
  {
    id: text()
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    name: createEnumColumn(AchievementName).notNull().unique(),
  },
  { schema: achievementSchema },
);

export type AchievementInAchievement = typeof achievementsInAchievement.$inferSelect;
