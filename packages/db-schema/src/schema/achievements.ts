import { pgTable } from "@/pgTable";
import { userAchievements } from "@/schema/userAchievements";
import { AchievementName, achievementNameSchema } from "@/services/achievement/AchievementName";
import { relations } from "drizzle-orm";
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

export const achievementsRelations = relations(achievements, ({ many }) => ({
  userAchievements: many(userAchievements),
}));
