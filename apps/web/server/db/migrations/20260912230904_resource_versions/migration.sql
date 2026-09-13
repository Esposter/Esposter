CREATE TYPE "snapshotChannel" AS ENUM('published', 'revisions');--> statement-breakpoint
CREATE TYPE "snapshotReason" AS ENUM('Automatic', 'BeforeImport', 'BeforeRestore');--> statement-breakpoint
CREATE TABLE "resourceVersions" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"baseHash" text DEFAULT '' NOT NULL,
	"channel" "snapshotChannel",
	"hash" text NOT NULL,
	"plaintextBytes" bigint NOT NULL,
	"reason" "snapshotReason",
	"resourceId" uuid,
	"storedBytes" bigint NOT NULL,
	"summary" text DEFAULT '' NOT NULL,
	"version" integer,
	CONSTRAINT "resourceVersions_pkey" PRIMARY KEY("resourceId","channel","version"),
	CONSTRAINT "resourceVersions_plaintextBytes_check" CHECK ("plaintextBytes" >= 0),
	CONSTRAINT "resourceVersions_storedBytes_check" CHECK ("storedBytes" >= 0)
);
--> statement-breakpoint
ALTER TABLE "resourceVersions" ADD CONSTRAINT "resourceVersions_resourceId_resources_id_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE;