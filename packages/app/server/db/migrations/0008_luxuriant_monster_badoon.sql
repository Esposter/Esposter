ALTER TABLE "Account" RENAME COLUMN "deletedAt" TO "deleted_at";--> statement-breakpoint
ALTER TABLE "Session" RENAME COLUMN "deletedAt" TO "deleted_at";--> statement-breakpoint
ALTER TABLE "User" RENAME COLUMN "deletedAt" TO "deleted_at";--> statement-breakpoint
ALTER TABLE "Verification" RENAME COLUMN "deletedAt" TO "deleted_at";--> statement-breakpoint
ALTER TABLE "Like" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "Like" DROP COLUMN "deletedAt";--> statement-breakpoint
ALTER TABLE "Like" DROP COLUMN "updatedAt";--> statement-breakpoint
ALTER TABLE "UserToRoom" DROP COLUMN "createdAt";--> statement-breakpoint
ALTER TABLE "UserToRoom" DROP COLUMN "deletedAt";--> statement-breakpoint
ALTER TABLE "UserToRoom" DROP COLUMN "updatedAt";