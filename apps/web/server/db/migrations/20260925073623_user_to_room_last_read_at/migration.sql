ALTER TABLE "message"."usersToRooms" ADD COLUMN "lastReadAt" timestamp;
--> statement-breakpoint
UPDATE "message"."usersToRooms" SET "lastReadAt" = "lastMessageAt";
