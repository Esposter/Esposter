ALTER TABLE "message"."push_subscriptions" RENAME COLUMN "expiration_time" TO "expirationTime";--> statement-breakpoint
ALTER TABLE "message"."push_subscriptions" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "message"."search_histories" RENAME COLUMN "room_id" TO "roomId";--> statement-breakpoint
ALTER TABLE "message"."search_histories" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "user_achievements" RENAME COLUMN "achievement_id" TO "achievementId";--> statement-breakpoint
ALTER TABLE "user_achievements" RENAME COLUMN "unlocked_at" TO "unlockedAt";--> statement-breakpoint
ALTER TABLE "user_achievements" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER TABLE "message"."webhooks" RENAME COLUMN "creator_id" TO "creatorId";--> statement-breakpoint
ALTER TABLE "message"."webhooks" RENAME COLUMN "is_active" TO "isActive";--> statement-breakpoint
ALTER TABLE "message"."webhooks" RENAME COLUMN "room_id" TO "roomId";--> statement-breakpoint
ALTER TABLE "message"."webhooks" RENAME COLUMN "user_id" TO "userId";--> statement-breakpoint
ALTER INDEX "message"."room_roles_room_id_position_index" RENAME TO "room_roles_roomId_position_index";--> statement-breakpoint
ALTER INDEX "user_achievements_user_id_achievement_id_unique" RENAME TO "user_achievements_userId_achievementId_unique";--> statement-breakpoint
ALTER TABLE "message"."push_subscriptions" RENAME CONSTRAINT "push_subscriptions_endpoint_user_id_unique" TO "push_subscriptions_endpoint_userId_unique";