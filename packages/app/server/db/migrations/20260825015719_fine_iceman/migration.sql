CREATE TYPE "appNotificationType" AS ENUM('FriendRequest', 'Message', 'Reminder', 'ResourceOperation', 'TodoReminder');--> statement-breakpoint
CREATE TYPE "notificationSeverity" AS ENUM('error', 'info', 'success', 'warning');--> statement-breakpoint
CREATE TABLE "notifications" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"isRead" boolean DEFAULT false NOT NULL,
	"path" text DEFAULT '' NOT NULL,
	"severity" "notificationSeverity" NOT NULL,
	"title" text NOT NULL,
	"type" "appNotificationType" NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "message"."pushSubscriptions" SET SCHEMA "public";
--> statement-breakpoint
ALTER TABLE "pushSubscriptions" DROP CONSTRAINT "pushSubscriptions_endpoint_userId_unique";--> statement-breakpoint
ALTER TABLE "pushSubscriptions" ADD CONSTRAINT "pushSubscriptions_userId_endpoint_unique" UNIQUE("userId","endpoint");--> statement-breakpoint
CREATE INDEX "notifications_userId_createdAt_index" ON "notifications" ("userId","createdAt" DESC);--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;