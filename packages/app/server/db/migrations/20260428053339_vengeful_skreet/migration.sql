ALTER TABLE "message"."rooms" ADD COLUMN "isReadOnly" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD COLUMN "topic" text;--> statement-breakpoint
DROP INDEX "message"."room_roles_everyone_unique";--> statement-breakpoint
CREATE UNIQUE INDEX "room_roles_everyone_unique" ON "message"."room_roles" ("roomId") WHERE "isEveryone" = TRUE;--> statement-breakpoint
CREATE INDEX "users_to_rooms_timeout_until_index" ON "message"."users_to_rooms" ("timeoutUntil") WHERE "timeoutUntil" IS NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."app_users" DROP CONSTRAINT "app_users_name_length_check", ADD CONSTRAINT "app_users_name_length_check" CHECK (LENGTH(TRIM("name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "blocks" DROP CONSTRAINT "no_self_block", ADD CONSTRAINT "no_self_block" CHECK ("blockerId" != "blockedId");--> statement-breakpoint
ALTER TABLE "friend_requests" DROP CONSTRAINT "no_self_friend_request", ADD CONSTRAINT "no_self_friend_request" CHECK ("senderId" != "receiverId");--> statement-breakpoint
ALTER TABLE "friends" DROP CONSTRAINT "no_self_friendship", ADD CONSTRAINT "no_self_friendship" CHECK ("senderId" != "receiverId");--> statement-breakpoint
ALTER TABLE "message"."invites" DROP CONSTRAINT "invites_code_length_check", ADD CONSTRAINT "invites_code_length_check" CHECK (LENGTH("code") = 8);--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "likes_value_check", ADD CONSTRAINT "likes_value_check" CHECK ("value" = 1 OR "value" = -1);--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_title_length_check", ADD CONSTRAINT "posts_title_length_check" CHECK (LENGTH("title") <= 300);--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "posts_description_length_check", ADD CONSTRAINT "posts_description_length_check" CHECK (LENGTH("description") <= 1000);--> statement-breakpoint
ALTER TABLE "message"."room_categories" DROP CONSTRAINT "room_categories_name_length_check", ADD CONSTRAINT "room_categories_name_length_check" CHECK (LENGTH(TRIM("name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "message"."room_categories" DROP CONSTRAINT "room_categories_position_check", ADD CONSTRAINT "room_categories_position_check" CHECK ("position" >= 0);--> statement-breakpoint
ALTER TABLE "message"."room_roles" DROP CONSTRAINT "room_roles_name_length_check", ADD CONSTRAINT "room_roles_name_length_check" CHECK (LENGTH(TRIM("name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "message"."room_roles" DROP CONSTRAINT "room_roles_position_check", ADD CONSTRAINT "room_roles_position_check" CHECK ("position" >= 0);--> statement-breakpoint
ALTER TABLE "message"."rooms" DROP CONSTRAINT "rooms_name_check", ADD CONSTRAINT "rooms_name_check" CHECK (("type" = 'DirectMessage' AND "name" IS NULL) OR ("type" = 'Room' AND "name" IS NOT NULL AND LENGTH(TRIM("name")) BETWEEN 1 AND 100));--> statement-breakpoint
ALTER TABLE "message"."rooms" DROP CONSTRAINT "participant_key_type", ADD CONSTRAINT "participant_key_type" CHECK (("type" = 'DirectMessage' AND "participantKey" IS NOT NULL) OR ("type" = 'Room' AND "participantKey" IS NULL));--> statement-breakpoint
ALTER TABLE "message"."search_histories" DROP CONSTRAINT "search_histories_query_length_check", ADD CONSTRAINT "search_histories_query_length_check" CHECK (LENGTH("query") <= 10000);--> statement-breakpoint
ALTER TABLE "surveys" DROP CONSTRAINT "surveys_name_length_check", ADD CONSTRAINT "surveys_name_length_check" CHECK (LENGTH(TRIM("name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "user_achievements" DROP CONSTRAINT "user_achievements_amount_check", ADD CONSTRAINT "user_achievements_amount_check" CHECK ("amount" >= 1);--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_biography_length_check", ADD CONSTRAINT "users_biography_length_check" CHECK ("biography" IS NULL OR LENGTH("biography") <= 160);--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "users_name_length_check", ADD CONSTRAINT "users_name_length_check" CHECK (LENGTH(TRIM("name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "message"."user_statuses" DROP CONSTRAINT "user_statuses_message_length_check", ADD CONSTRAINT "user_statuses_message_length_check" CHECK (LENGTH("message") <= 64);--> statement-breakpoint
ALTER TABLE "message"."webhooks" DROP CONSTRAINT "webhooks_name_length_check", ADD CONSTRAINT "webhooks_name_length_check" CHECK (LENGTH(TRIM("name")) BETWEEN 1 AND 100);