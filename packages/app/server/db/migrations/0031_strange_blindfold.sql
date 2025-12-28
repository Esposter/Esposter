TRUNCATE TABLE "public"."achievements" CASCADE;
ALTER TABLE "public"."achievements" 
ALTER COLUMN "name" SET DATA TYPE text;

DROP TYPE "public"."achievement_name";--> statement-breakpoint
CREATE TYPE "public"."achievement_name" AS ENUM('ClickerAddict', 'ClickerNovice', 'ClickerPro', 'ClickerSaver', 'DungeonCrawler', 'DungeonMaster', 'EmailMarketer', 'Flowcharter', 'CriticalThinker', 'Liker', 'SuperFan', 'Unliker', 'CenturyClub', 'Chatterbox', 'ConversationKeeper', 'EarlyBird', 'EssayWriter', 'FileSharer', 'FirstMessage', 'Gossip', 'LinkSharer', 'MessageEditor', 'MessageForwarder', 'MessageMaster', 'NightOwl', 'PinCollector', 'SecondThoughts', 'ShortAndSweet', 'Typist', 'Unpinner', 'Verbose', 'BriefComment', 'Commentator', 'CommentDeleter', 'CommentEditor', 'DetailedPost', 'Novelist', 'PostDeleter', 'PostEditor', 'PosterChild', 'ProlificPoster', 'Inviter', 'PartyHost', 'RoomCreator', 'RoomDestroyer', 'RoomHopper', 'RoomJoiner', 'RoomLeaver', 'RoomRenovator', 'Socialite', 'AllCaps', 'AllLower', 'Meta', 'Palindrome', 'DataCollector', 'Modeler', 'Publisher', 'Respondent', 'ResponseEditor', 'SurveyDeleter', 'SurveyEditor', 'SurveyGuru', 'Surveyor', 'SurveySays', 'DataAnalyst', 'WebDeveloper');

ALTER TABLE "public"."achievements" 
ALTER COLUMN "name" SET DATA TYPE "public"."achievement_name" 
USING "name"::"public"."achievement_name";