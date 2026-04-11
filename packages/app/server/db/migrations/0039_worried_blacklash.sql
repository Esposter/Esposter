ALTER TABLE "message"."users_to_rooms" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."users_to_rooms" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "message"."users_to_rooms" ADD COLUMN "updatedAt" timestamp NOT NULL;