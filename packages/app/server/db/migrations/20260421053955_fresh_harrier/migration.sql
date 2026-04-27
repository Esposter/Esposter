ALTER TABLE "message"."app_users" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "message"."invites" DROP CONSTRAINT "code";--> statement-breakpoint
ALTER TABLE "likes" DROP CONSTRAINT "value";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "title";--> statement-breakpoint
ALTER TABLE "posts" DROP CONSTRAINT "description";--> statement-breakpoint
ALTER TABLE "message"."room_categories" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "message"."room_categories" DROP CONSTRAINT "position";--> statement-breakpoint
ALTER TABLE "message"."room_roles" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "message"."room_roles" DROP CONSTRAINT "position";--> statement-breakpoint
ALTER TABLE "message"."rooms" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "message"."search_histories" DROP CONSTRAINT "query";--> statement-breakpoint
ALTER TABLE "surveys" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "user_achievements" DROP CONSTRAINT "amount";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "biography";--> statement-breakpoint
ALTER TABLE "users" DROP CONSTRAINT "name";--> statement-breakpoint
ALTER TABLE "message"."user_statuses" DROP CONSTRAINT "message";--> statement-breakpoint
ALTER TABLE "message"."webhooks" DROP CONSTRAINT "name";--> statement-breakpoint
DROP INDEX "blocks_blockedId_idx";--> statement-breakpoint
DROP INDEX "friend_requests_receiverId_idx";--> statement-breakpoint
DROP INDEX "friend_requests_senderId_idx";--> statement-breakpoint
DROP INDEX "friends_receiverId_idx";--> statement-breakpoint
DROP INDEX "friends_senderId_idx";--> statement-breakpoint
DROP INDEX "message"."room_roles_room_id_position_idx";--> statement-breakpoint
DROP INDEX "user_achievements_user_id_achievement_id_index";--> statement-breakpoint
DROP INDEX "message"."users_to_room_roles_roleId_idx";--> statement-breakpoint
DROP INDEX "message"."users_to_room_roles_roomId_idx";--> statement-breakpoint
ALTER TABLE "message"."rooms" ALTER COLUMN "name" DROP NOT NULL;--> statement-breakpoint
CREATE INDEX "blocks_blockedId_index" ON "blocks" USING btree ("blockedId");--> statement-breakpoint
CREATE INDEX "friend_requests_receiverId_index" ON "friend_requests" USING btree ("receiverId");--> statement-breakpoint
CREATE INDEX "friend_requests_senderId_index" ON "friend_requests" USING btree ("senderId");--> statement-breakpoint
CREATE INDEX "friends_receiverId_index" ON "friends" USING btree ("receiverId");--> statement-breakpoint
CREATE INDEX "friends_senderId_index" ON "friends" USING btree ("senderId");--> statement-breakpoint
CREATE INDEX "room_roles_room_id_position_index" ON "message"."room_roles" USING btree ("roomId","position");--> statement-breakpoint
CREATE UNIQUE INDEX "user_achievements_user_id_achievement_id_unique" ON "user_achievements" USING btree ("user_id","achievement_id");--> statement-breakpoint
CREATE INDEX "users_to_room_roles_roleId_index" ON "message"."users_to_room_roles" USING btree ("roleId");--> statement-breakpoint
CREATE INDEX "users_to_room_roles_roomId_index" ON "message"."users_to_room_roles" USING btree ("roomId");--> statement-breakpoint
ALTER TABLE "message"."app_users" ADD CONSTRAINT "app_users_name_length_check" CHECK (LENGTH(TRIM("message"."app_users"."name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "message"."invites" ADD CONSTRAINT "invites_code_length_check" CHECK (LENGTH("message"."invites"."code") = 8);--> statement-breakpoint
ALTER TABLE "likes" ADD CONSTRAINT "likes_value_check" CHECK ("likes"."value" = 1 OR "likes"."value" = -1);--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_title_length_check" CHECK (LENGTH("posts"."title") <= 300);--> statement-breakpoint
ALTER TABLE "posts" ADD CONSTRAINT "posts_description_length_check" CHECK (LENGTH("posts"."description") <= 1000);--> statement-breakpoint
ALTER TABLE "message"."room_categories" ADD CONSTRAINT "room_categories_name_length_check" CHECK (LENGTH(TRIM("message"."room_categories"."name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "message"."room_categories" ADD CONSTRAINT "room_categories_position_check" CHECK ("message"."room_categories"."position" >= 0);--> statement-breakpoint
ALTER TABLE "message"."room_roles" ADD CONSTRAINT "room_roles_name_length_check" CHECK (LENGTH(TRIM("message"."room_roles"."name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "message"."room_roles" ADD CONSTRAINT "room_roles_position_check" CHECK ("message"."room_roles"."position" >= 0);--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD CONSTRAINT "rooms_name_check" CHECK (("message"."rooms"."type" = 'DirectMessage' AND "message"."rooms"."name" IS NULL) OR ("message"."rooms"."type" = 'Room' AND "message"."rooms"."name" IS NOT NULL AND LENGTH(TRIM("message"."rooms"."name")) BETWEEN 1 AND 100));--> statement-breakpoint
ALTER TABLE "message"."search_histories" ADD CONSTRAINT "search_histories_query_length_check" CHECK (LENGTH("message"."search_histories"."query") <= 10000);--> statement-breakpoint
ALTER TABLE "surveys" ADD CONSTRAINT "surveys_name_length_check" CHECK (LENGTH(TRIM("surveys"."name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_amount_check" CHECK ("user_achievements"."amount" >= 1);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_biography_length_check" CHECK ("users"."biography" IS NULL OR LENGTH("users"."biography") <= 160);--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_name_length_check" CHECK (LENGTH(TRIM("users"."name")) BETWEEN 1 AND 100);--> statement-breakpoint
ALTER TABLE "message"."user_statuses" ADD CONSTRAINT "user_statuses_message_length_check" CHECK (LENGTH("message"."user_statuses"."message") <= 64);--> statement-breakpoint
ALTER TABLE "message"."webhooks" ADD CONSTRAINT "webhooks_name_length_check" CHECK (LENGTH(TRIM("message"."webhooks"."name")) BETWEEN 1 AND 100);