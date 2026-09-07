ALTER TABLE "message"."searchHistories" DROP CONSTRAINT "search_histories_room_id_rooms_id_fk";--> statement-breakpoint
ALTER TABLE "message"."searchHistories" DROP CONSTRAINT "search_histories_user_id_users_id_fk";--> statement-breakpoint
ALTER TABLE "message"."webhooks" ALTER COLUMN "name" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "message"."searchHistories" ADD CONSTRAINT "searchHistories_roomId_rooms_id_fkey" FOREIGN KEY ("roomId") REFERENCES "message"."rooms"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message"."searchHistories" ADD CONSTRAINT "searchHistories_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;--> statement-breakpoint
ALTER TABLE "message"."userSettings" ADD CONSTRAINT "userSettings_pushToTalkKeybind_length_check" CHECK (LENGTH("pushToTalkKeybind") <= 64);