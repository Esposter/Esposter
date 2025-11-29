import { pgTable } from "@/pgTable";
import { userAchievements } from "@/schema/userAchievements";
import { relations } from "drizzle-orm";
import { pgEnum, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export enum AchievementName {
  CenturyClub = "CenturyClub",
  Chatterbox = "Chatterbox",
  ClickerAddict = "ClickerAddict",
  ClickerNovice = "ClickerNovice",
  ClickerPro = "ClickerPro",
  ClickerSaver = "ClickerSaver",
  Commentator = "Commentator",
  CommentDeleter = "CommentDeleter",
  CommentEditor = "CommentEditor",
  ConversationKeeper = "ConversationKeeper",
  DataAnalyst = "DataAnalyst",
  DataCollector = "DataCollector",
  DungeonCrawler = "DungeonCrawler",
  DungeonMaster = "DungeonMaster",
  EmailMarketer = "EmailMarketer",
  EssayWriter = "EssayWriter",
  FileSharer = "FileSharer",
  FirstMessage = "FirstMessage",
  Flowcharter = "Flowcharter",
  Gossip = "Gossip",
  Inviter = "Inviter",
  Liker = "Liker",
  MessageEditor = "MessageEditor",
  MessageForwarder = "MessageForwarder",
  MessageMaster = "MessageMaster",
  Meta = "Meta",
  Modeler = "Modeler",
  NightOwl = "NightOwl",
  PartyHost = "PartyHost",
  PinCollector = "PinCollector",
  Popular = "Popular",
  PostDeleter = "PostDeleter",
  PostEditor = "PostEditor",
  PosterChild = "PosterChild",
  ProlificPoster = "ProlificPoster",
  Publisher = "Publisher",
  Respondent = "Respondent",
  ResponseEditor = "ResponseEditor",
  RoomCreator = "RoomCreator",
  RoomDestroyer = "RoomDestroyer",
  RoomHopper = "RoomHopper",
  RoomJoiner = "RoomJoiner",
  RoomLeaver = "RoomLeaver",
  RoomRenovator = "RoomRenovator",
  SecondThoughts = "SecondThoughts",
  Socialite = "Socialite",
  SuperFan = "SuperFan",
  SurveyDeleter = "SurveyDeleter",
  SurveyEditor = "SurveyEditor",
  SurveyGuru = "SurveyGuru",
  Surveyor = "Surveyor",
  SurveySays = "SurveySays",
  Typist = "Typist",
  Unliker = "Unliker",
  Unpinner = "Unpinner",
  WebDeveloper = "WebDeveloper",
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
