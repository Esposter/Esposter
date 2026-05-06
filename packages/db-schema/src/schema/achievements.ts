import { pgTable } from "@/pgTable";
import { AchievementName, achievementNameSchema } from "@/services/achievement/AchievementName";
import { pgEnum, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-orm/zod";

export const achievementNameEnum = pgEnum("achievement_name", AchievementName);

export const achievements = pgTable("achievements", {
  id: uuid().primaryKey().defaultRandom(),
  name: achievementNameEnum().notNull().unique(),
});

export type Achievement = typeof achievements.$inferSelect;

export const selectAchievementSchema = createSelectSchema(achievements, {
  name: achievementNameSchema,
});
