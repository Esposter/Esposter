ALTER TABLE "message"."usersToRooms" RENAME COLUMN "nickname" TO "displayName";--> statement-breakpoint
ALTER TABLE "message"."usersToRooms" RENAME CONSTRAINT "usersToRooms_nickname_length_check" TO "usersToRooms_displayName_length_check";
