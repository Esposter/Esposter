CREATE TABLE "message"."roomFilters" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"roomId" uuid NOT NULL UNIQUE,
	"words" text[] DEFAULT '{}'::text[] NOT NULL
);
--> statement-breakpoint
ALTER TABLE "message"."rooms" ADD COLUMN "slowmodeMs" integer;--> statement-breakpoint
ALTER TABLE "message"."users_to_rooms" ADD COLUMN "lastMessageAt" timestamp;--> statement-breakpoint
ALTER TABLE "message"."roomFilters" ADD CONSTRAINT "roomFilters_roomId_rooms_id_fkey" FOREIGN KEY ("roomId") REFERENCES "message"."rooms"("id") ON DELETE CASCADE;