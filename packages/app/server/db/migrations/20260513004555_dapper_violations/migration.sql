ALTER TABLE "message"."invites" DROP CONSTRAINT "invites_code_unique";--> statement-breakpoint
ALTER TABLE "message"."roomFilters" DROP CONSTRAINT "roomFilters_roomId_key";--> statement-breakpoint
ALTER TABLE "message"."invites" DROP CONSTRAINT "invites_token_length_check";--> statement-breakpoint
DROP INDEX "user_achievements_userId_achievementId_unique";--> statement-breakpoint
ALTER TABLE "userAchievements" RENAME CONSTRAINT "user_achievements_pkey" TO "userAchievements_pkey";--> statement-breakpoint
DELETE FROM "message"."invites";--> statement-breakpoint
ALTER TABLE "message"."invites" DROP COLUMN "token";--> statement-breakpoint
ALTER TABLE "message"."roomFilters" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "userAchievements" DROP COLUMN "id";--> statement-breakpoint
ALTER TABLE "message"."roomFilters" ADD PRIMARY KEY ("roomId");--> statement-breakpoint
ALTER TABLE "userAchievements" ADD PRIMARY KEY ("userId","achievementId");--> statement-breakpoint
ALTER TABLE "message"."invites" ALTER COLUMN "id" SET DATA TYPE text USING "id"::text;--> statement-breakpoint
ALTER TABLE "message"."invites" ALTER COLUMN "id" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "message"."invites" ADD CONSTRAINT "invites_id_length_check" CHECK (LENGTH("id") = 8);
