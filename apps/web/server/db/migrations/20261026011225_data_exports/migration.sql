CREATE SCHEMA "user";
--> statement-breakpoint
CREATE TYPE "user"."dataExportStatus" AS ENUM('building', 'failed', 'queued', 'ready');--> statement-breakpoint
CREATE TABLE "user"."dataExports" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"blobName" text,
	"expiresAt" timestamp,
	"failureReason" text,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"readyAt" timestamp,
	"status" "user"."dataExportStatus" NOT NULL,
	"userId" text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "dataExports_userId_status_unique" ON "user"."dataExports" ("userId") WHERE "status" IN ('queued', 'building');--> statement-breakpoint
CREATE INDEX "dataExports_userId_index" ON "user"."dataExports" ("userId");--> statement-breakpoint
ALTER TABLE "user"."dataExports" ADD CONSTRAINT "dataExports_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "auth"."users"("id") ON DELETE CASCADE;