CREATE TYPE "document_type" AS ENUM('Dashboard', 'Email', 'Flowchart', 'Table', 'Webpage');--> statement-breakpoint
CREATE TABLE "documents" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"contentVersion" integer DEFAULT 0 NOT NULL,
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
	"name" text NOT NULL,
	"publishedAt" timestamp,
	"publishVersion" integer DEFAULT 0 NOT NULL,
	"type" "document_type" NOT NULL,
	"userId" text NOT NULL,
	CONSTRAINT "documents_name_length_check" CHECK (LENGTH(TRIM("name")) BETWEEN 1 AND 100)
);
--> statement-breakpoint
ALTER TABLE "documents" ADD CONSTRAINT "documents_userId_users_id_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE;