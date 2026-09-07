CREATE TYPE "public"."room_type" AS ENUM('DirectMessage', 'Room');--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD COLUMN "participantKey" text;--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD COLUMN "type" "room_type" DEFAULT 'Room' NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."users_to_rooms" ADD COLUMN "isHidden" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD CONSTRAINT "rooms_participantKey_unique" UNIQUE("participantKey");