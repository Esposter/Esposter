ALTER TABLE "message"."userSettings" ADD COLUMN "pushToTalkReleaseDelayMs" integer DEFAULT 20 NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."usersToRooms" ADD COLUMN "mentionCount" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."userSettings" ADD CONSTRAINT "user_settings_push_to_talk_release_delay_ms_check" CHECK ("pushToTalkReleaseDelayMs" BETWEEN 0 AND 2000);--> statement-breakpoint
ALTER TABLE "message"."usersToRooms" ADD CONSTRAINT "users_to_rooms_mention_count_check" CHECK ("mentionCount" >= 0);