CREATE TYPE "word_filter_action" AS ENUM('Reject', 'Timeout', 'Warn');--> statement-breakpoint
ALTER TYPE "achievement_name" ADD VALUE 'ClickerArchitect' BEFORE 'ClickerChampion';--> statement-breakpoint
ALTER TYPE "achievement_name" ADD VALUE 'ClickerBillionaire' BEFORE 'ClickerChampion';--> statement-breakpoint
ALTER TYPE "achievement_name" ADD VALUE 'ClickerCompletionist' BEFORE 'ClickerNovice';--> statement-breakpoint
ALTER TYPE "achievement_name" ADD VALUE 'ClickerMillionaire' BEFORE 'ClickerNovice';--> statement-breakpoint
ALTER TYPE "achievement_name" ADD VALUE 'ClickerTrillionaire' BEFORE 'DungeonCrawler';--> statement-breakpoint
ALTER TYPE "achievement_name" ADD VALUE 'DungeonHomeowner' BEFORE 'DungeonMaster';--> statement-breakpoint
ALTER TYPE "achievement_name" ADD VALUE 'MonsterCatcher' BEFORE 'EmailMarketer';--> statement-breakpoint
ALTER TYPE "achievement_name" ADD VALUE 'MonsterCollector' BEFORE 'EmailMarketer';--> statement-breakpoint
ALTER TYPE "achievement_name" ADD VALUE 'MonsterElite' BEFORE 'EmailMarketer';--> statement-breakpoint
ALTER TYPE "achievement_name" ADD VALUE 'MonsterTrainer' BEFORE 'EmailMarketer';--> statement-breakpoint
CREATE TABLE "message"."threadFollows" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"roomId" uuid,
	"threadRootRowKey" text,
	"userId" text,
	CONSTRAINT "threadFollows_pkey" PRIMARY KEY("userId","roomId","threadRootRowKey")
);
--> statement-breakpoint
ALTER TABLE "message"."roomFilters" ADD COLUMN "action" "word_filter_action" DEFAULT 'Reject'::"word_filter_action" NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."roomFilters" ADD COLUMN "timeoutDurationMs" integer;--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "type" SET DATA TYPE text;--> statement-breakpoint
DROP TYPE "resource_type";--> statement-breakpoint
CREATE TYPE "resource_type" AS ENUM('Blueprint', 'Dashboard', 'Email', 'Flowchart', 'Note', 'Program', 'Sheet', 'Survey', 'TodoList', 'Webpage');--> statement-breakpoint
ALTER TABLE "resources" ALTER COLUMN "type" SET DATA TYPE "resource_type" USING "type"::"resource_type";--> statement-breakpoint
ALTER TABLE "message"."threadFollows" ADD CONSTRAINT "threadFollows_roomId_rooms_id_fkey" FOREIGN KEY ("roomId") REFERENCES "message"."rooms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message"."threadFollows" ADD CONSTRAINT "threadFollows_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message"."roomFilters" ADD CONSTRAINT "room_filters_timeout_duration_check" CHECK (("action" = 'Timeout' AND "timeoutDurationMs" IS NOT NULL AND "timeoutDurationMs" > 0) OR ("action" <> 'Timeout' AND "timeoutDurationMs" IS NULL));