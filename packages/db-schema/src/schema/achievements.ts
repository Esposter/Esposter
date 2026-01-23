import { pgTable } from "@/pgTable";
import { AchievementName, achievementNameSchema } from "@/services/achievement/AchievementName";
import { pgEnum, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";

export const achievementNameEnum = pgEnum("achievement_name", AchievementName);

export const achievements = pgTable("achievements", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: achievementNameEnum("name").notNull().unique(),
});

export type Achievement = typeof achievements.$inferSelect;

export const selectAchievementSchema = createSelectSchema(achievements, {
  name: achievementNameSchema,
});
