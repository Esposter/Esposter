import { pgTable } from "@/pgTable";
import { AchievementName } from "@/services/achievement/AchievementName";
import { pgEnum, uuid } from "drizzle-orm/pg-core";

export const achievementNameEnum = pgEnum("achievementName", AchievementName);

export const achievements = pgTable("achievements", {
  id: uuid().primaryKey().defaultRandom(),
  name: achievementNameEnum().notNull().unique(),
});

export type Achievement = typeof achievements.$inferSelect;
