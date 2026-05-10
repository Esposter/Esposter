ALTER TABLE "likes" ADD COLUMN "createdAt" timestamp;--> statement-breakpoint
ALTER TABLE "likes" ADD COLUMN "updatedAt" timestamp;--> statement-breakpoint
ALTER TABLE "likes" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
UPDATE "likes" SET "createdAt" = now(), "updatedAt" = now();--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "createdAt" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "likes" ALTER COLUMN "updatedAt" SET NOT NULL;