ALTER TABLE "user_statuses" ADD COLUMN "createdAt" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_statuses" ADD COLUMN "deletedAt" timestamp;--> statement-breakpoint
ALTER TABLE "user_statuses" ADD COLUMN "updatedAt" timestamp NOT NULL;--> statement-breakpoint
ALTER TABLE "user_statuses" ADD COLUMN "isConnected" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_statuses" DROP COLUMN "lastActiveAt";