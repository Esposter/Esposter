CREATE TYPE "azure_container" AS ENUM('app-assets', 'clicker-assets', 'deadletter', 'dungeons-assets', 'message-assets', 'private-user-assets', 'public-user-assets', 'resource-assets');--> statement-breakpoint
CREATE TYPE "storage_tier" AS ENUM('Free');--> statement-breakpoint
CREATE TABLE "storage_blobs" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"blobName" text,
	"containerName" "azure_container",
	"countedBytes" bigint NOT NULL,
	"declaredBytes" bigint NOT NULL,
	"expiresAt" timestamp NOT NULL,
	"reconciledAt" timestamp,
	"userId" text NOT NULL,
	CONSTRAINT "storage_blobs_pkey" PRIMARY KEY("containerName","blobName"),
	CONSTRAINT "storage_blobs_declared_bytes_check" CHECK ("declaredBytes" >= 0),
	CONSTRAINT "storage_blobs_counted_bytes_check" CHECK ("countedBytes" >= 0)
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "storageBytesUsed" bigint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "storageTier" "storage_tier" DEFAULT 'Free'::"storage_tier" NOT NULL;--> statement-breakpoint
CREATE INDEX "storage_blobs_reconciledAt_expiresAt_index" ON "storage_blobs" ("reconciledAt","expiresAt");--> statement-breakpoint
CREATE INDEX "storage_blobs_userId_reconciledAt_index" ON "storage_blobs" ("userId","reconciledAt");--> statement-breakpoint
ALTER TABLE "storage_blobs" ADD CONSTRAINT "storage_blobs_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;