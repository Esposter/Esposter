ALTER TABLE "message"."users_to_rooms" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "message"."users_to_rooms" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "message"."users_to_rooms" 
ADD COLUMN "updatedAt" timestamp;

UPDATE "message"."users_to_rooms" 
SET "updatedAt" = now() 
WHERE "updatedAt" IS NULL;

ALTER TABLE "message"."users_to_rooms" 
ALTER COLUMN "updatedAt" SET NOT NULL;