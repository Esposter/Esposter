ALTER TYPE "document_type" RENAME TO "resource_type";--> statement-breakpoint
ALTER TYPE "resource_type" ADD VALUE 'File' BEFORE 'Flowchart';--> statement-breakpoint
ALTER TYPE "resource_type" ADD VALUE 'Survey' BEFORE 'Table';--> statement-breakpoint
ALTER TYPE "resource_type" ADD VALUE 'TodoList' BEFORE 'Webpage';--> statement-breakpoint
CREATE TABLE "resource_publications" (
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp,
	"updatedAt" timestamp NOT NULL,
	"publishedAt" timestamp DEFAULT now() NOT NULL,
	"publishVersion" integer DEFAULT 1 NOT NULL,
	"resourceId" uuid PRIMARY KEY
);
--> statement-breakpoint
ALTER TABLE "documents" RENAME TO "resources";--> statement-breakpoint
ALTER TABLE "resources" RENAME CONSTRAINT "documents_name_length_check" TO "resources_name_length_check";--> statement-breakpoint
ALTER TABLE "resources" DROP COLUMN "publishedAt";--> statement-breakpoint
ALTER TABLE "resources" DROP COLUMN "publishVersion";--> statement-breakpoint
ALTER TABLE "resource_publications" ADD CONSTRAINT "resource_publications_resourceId_resources_id_fkey" FOREIGN KEY ("resourceId") REFERENCES "resources"("id") ON DELETE CASCADE;