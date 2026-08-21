CREATE TABLE "message"."roomEmojis" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"roomId" uuid NOT NULL,
	CONSTRAINT "roomEmojis_name_length_check" CHECK (LENGTH(TRIM("name")) BETWEEN 1 AND 32),
	CONSTRAINT "roomEmojis_name_charset_check" CHECK ("name" ~ '^[a-z0-9_]+$')
);
--> statement-breakpoint
CREATE UNIQUE INDEX "roomEmojis_roomId_name_unique" ON "message"."roomEmojis" ("roomId","name");--> statement-breakpoint
ALTER TABLE "message"."roomEmojis" ADD CONSTRAINT "roomEmojis_roomId_rooms_id_fkey" FOREIGN KEY ("roomId") REFERENCES "message"."rooms"("id") ON DELETE CASCADE;