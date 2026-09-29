import { pgTable } from "#src/pgTable";
import { achievementSchema } from "#src/schema/achievement/achievementSchema";
import { AchievementName } from "#src/services/achievement/AchievementName";
import { uuid } from "drizzle-orm/pg-core";

export const achievementNameEnum = achievementSchema.enum("achievementName", AchievementName);

export const achievementsInAchievement = pgTable(
  "achievements",
  { id: uuid().primaryKey().defaultRandom(), name: achievementNameEnum().notNull().unique() },
  { schema: achievementSchema },
);

export type AchievementInAchievement = typeof achievementsInAchievement.$inferSelect;
