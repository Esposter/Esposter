import { pgTable } from "@/pgTable";
import { userAchievements } from "@/schema/userAchievements";
import { relations } from "drizzle-orm";
import { pgEnum, uuid } from "drizzle-orm/pg-core";
import { createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export enum AchievementName {
  AllCaps = "AllCaps",
  AllLower = "AllLower",
  BriefComment = "BriefComment",
  CenturyClub = "CenturyClub",
  Chatterbox = "Chatterbox",
  ClickerAddict = "ClickerAddict",
  ClickerNovice = "ClickerNovice",
  ClickerPro = "ClickerPro",
  ClickerSaver = "ClickerSaver",
  Commentator = "Commentator",
  CommentDeleter = "CommentDeleter",
  CommentEditor = "CommentEditor",
  ComprehensiveSurvey = "ComprehensiveSurvey",
  ConversationKeeper = "ConversationKeeper",
  CriticalThinker = "CriticalThinker",
  DataAnalyst = "DataAnalyst",
  DataCollector = "DataCollector",
  DescriptiveHost = "DescriptiveHost",
  DetailedFeedback = "DetailedFeedback",
  DetailedPost = "DetailedPost",
  DungeonCrawler = "DungeonCrawler",
  DungeonMaster = "DungeonMaster",
  EarlyBird = "EarlyBird",
  EmailMarketer = "EmailMarketer",
  Enthusiast = "Enthusiast",
  EssayWriter = "EssayWriter",
  FileSharer = "FileSharer",
  FirstMessage = "FirstMessage",
  Flowcharter = "Flowcharter",
  FullInventory = "FullInventory",
  Gossip = "Gossip",
  HighLevel = "HighLevel",
  Inviter = "Inviter",
  Liker = "Liker",
  LinkSharer = "LinkSharer",
  MessageEditor = "MessageEditor",
  MessageForwarder = "MessageForwarder",
  MessageMaster = "MessageMaster",
  Meta = "Meta",
  Modeler = "Modeler",
  NightOwl = "NightOwl",
  Novelist = "Novelist",
  OpenDoor = "OpenDoor",
  Palindrome = "Palindrome",
  PartyHost = "PartyHost",
  PinCollector = "PinCollector",
  Popular = "Popular",
  PostDeleter = "PostDeleter",
  PostEditor = "PostEditor",
  PosterChild = "PosterChild",
  PrivateRoom = "PrivateRoom",
  ProlificPoster = "ProlificPoster",
  Publisher = "Publisher",
  QuickClicker = "QuickClicker",
  QuickSurvey = "QuickSurvey",
  Respondent = "Respondent",
  ResponseEditor = "ResponseEditor",
  Rich = "Rich",
  RoomCreator = "RoomCreator",
  RoomDestroyer = "RoomDestroyer",
  RoomHopper = "RoomHopper",
  RoomJoiner = "RoomJoiner",
  RoomLeaver = "RoomLeaver",
  RoomRenovator = "RoomRenovator",
  SecondThoughts = "SecondThoughts",
  ShortAndSweet = "ShortAndSweet",
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
  Verbose = "Verbose",
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
