import { pgTable } from "@/pgTable";
import { userAchievements } from "@/schema/userAchievements";
import { relations } from "drizzle-orm";
import { pgEnum, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export enum AchievementName {
  CenturyClub = "CenturyClub",
  ConversationKeeper = "ConversationKeeper",
  EssayWriter = "EssayWriter",
  FileSharer = "FileSharer",
  FirstMessage = "FirstMessage",
  MessageForwarder = "MessageForwarder",
  MessageMaster = "MessageMaster",
  Meta = "Meta",
  NightOwl = "NightOwl",
  PinCollector = "PinCollector",
  ProlificPoster = "ProlificPoster",
  RoomCreator = "RoomCreator",
  SecondThoughts = "SecondThoughts",
  Socialite = "Socialite",
}

const achievementNameSchema = z.enum(AchievementName) satisfies z.ZodType<AchievementName>;

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
